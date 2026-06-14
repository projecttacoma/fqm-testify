import { Buffer } from 'buffer';
import { phenomlClient } from 'phenoml';

const DEFAULT_PROFILES_URL = 'https://hl7.org/fhir/us/qicore/STU6/profiles.html';
const DEFAULT_IMPLEMENTATION_GUIDE = 'qicore_stu6';
const DEFAULT_PROFILE_CONTEXT =
  'QI-Core STU6 profiles for clinical quality measurement. Prefer QI-Core profiles when extracting clinical resources, including not-done, not-requested, and declined profiles when the narrative indicates negation or refusal.';

interface ScriptOptions {
  dryRun: boolean;
  failFast: boolean;
  implementationGuide: string;
  limit: number | null;
  profileContext: string | null;
  profilesUrl: string;
}

interface QicoreProfileSource {
  htmlUrl: string;
  jsonUrl: string;
}

interface StructureDefinition {
  resourceType?: string;
  id?: string;
  url?: string;
  kind?: string;
  derivation?: string;
  type?: string;
  snapshot?: {
    element?: unknown[];
  };
}

function getFlagValue(flag: string) {
  const prefix = `${flag}=`;
  return process.argv.find(arg => arg.startsWith(prefix))?.slice(prefix.length);
}

function parseLimit() {
  const rawLimit = getFlagValue('--limit');

  if (!rawLimit) {
    return null;
  }

  const limit = Number.parseInt(rawLimit, 10);

  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error('--limit must be a positive integer.');
  }

  return limit;
}

function getScriptOptions(): ScriptOptions {
  return {
    dryRun: process.argv.includes('--dry-run'),
    failFast: process.argv.includes('--fail-fast'),
    implementationGuide:
      getFlagValue('--implementation-guide') ??
      process.env.QICORE_PHENOML_IMPLEMENTATION_GUIDE ??
      DEFAULT_IMPLEMENTATION_GUIDE,
    limit: parseLimit(),
    profileContext: process.argv.includes('--no-profile-context')
      ? null
      : getFlagValue('--profile-context') ?? process.env.QICORE_PHENOML_PROFILE_CONTEXT ?? DEFAULT_PROFILE_CONTEXT,
    profilesUrl: getFlagValue('--profiles-url') ?? process.env.QICORE_PROFILES_URL ?? DEFAULT_PROFILES_URL
  };
}

function getPhenomlClient() {
  const token = process.env.PHENOML_TOKEN ?? process.env.NEXT_PUBLIC_PHENOML_TOKEN;
  const baseUrl = process.env.PHENOML_BASE_URL ?? process.env.NEXT_PUBLIC_PHENOML_BASE_URL;

  if (!token) {
    throw new Error('Set PHENOML_TOKEN or NEXT_PUBLIC_PHENOML_TOKEN before uploading QI-Core profiles.');
  }

  return new phenomlClient({
    token,
    ...(baseUrl ? { baseUrl } : {})
  });
}

async function fetchText(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function getProfileJsonUrl(profileHtmlUrl: URL) {
  profileHtmlUrl.pathname = profileHtmlUrl.pathname.replace(/\.html$/, '.json');
  profileHtmlUrl.hash = '';
  profileHtmlUrl.search = '';
  return profileHtmlUrl.toString();
}

function extractQicoreProfileSources(profilesHtml: string, profilesUrl: string) {
  const sourcesByJsonUrl = new Map<string, QicoreProfileSource>();
  const hrefRegex = /href="([^"]*StructureDefinition-qicore-[^"]+\.html)"/g;

  for (const match of profilesHtml.matchAll(hrefRegex)) {
    const href = match[1];
    const profileHtmlUrl = new URL(href, profilesUrl);
    const fileName = profileHtmlUrl.pathname.split('/').pop() ?? '';

    if (!/^StructureDefinition-qicore-[^.]+\.html$/.test(fileName)) {
      continue;
    }

    const jsonUrl = getProfileJsonUrl(new URL(profileHtmlUrl.toString()));
    sourcesByJsonUrl.set(jsonUrl, {
      htmlUrl: profileHtmlUrl.toString(),
      jsonUrl
    });
  }

  return [...sourcesByJsonUrl.values()].sort((a, b) => a.jsonUrl.localeCompare(b.jsonUrl));
}

function isUploadableProfile(profile: StructureDefinition) {
  return (
    profile.resourceType === 'StructureDefinition' &&
    profile.kind === 'resource' &&
    profile.derivation === 'constraint' &&
    typeof profile.id === 'string' &&
    typeof profile.url === 'string' &&
    typeof profile.type === 'string' &&
    Array.isArray(profile.snapshot?.element)
  );
}

async function fetchStructureDefinition(source: QicoreProfileSource) {
  const json = await fetchText(source.jsonUrl);
  return JSON.parse(json) as StructureDefinition;
}

function encodeProfile(profile: StructureDefinition) {
  return Buffer.from(JSON.stringify(profile), 'utf8').toString('base64');
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return typeof error === 'string' ? error : JSON.stringify(error);
}

async function uploadQicoreProfiles() {
  const options = getScriptOptions();
  const profilesHtml = await fetchText(options.profilesUrl);
  const sources = extractQicoreProfileSources(profilesHtml, options.profilesUrl).slice(0, options.limit ?? undefined);
  const client = options.dryRun ? null : getPhenomlClient();
  let uploadedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  console.log(`Found ${sources.length} QI-Core profile link${sources.length === 1 ? '' : 's'}.`);
  console.log(`Implementation guide: ${options.implementationGuide}`);

  for (const source of sources) {
    try {
      const profile = await fetchStructureDefinition(source);

      if (!isUploadableProfile(profile)) {
        skippedCount += 1;
        console.log(`[skip] ${source.jsonUrl} is not a resource constraint StructureDefinition.`);
        continue;
      }

      if (options.dryRun || !client) {
        console.log(`[dry-run] ${profile.id} (${profile.type}) ${profile.url}`);
        continue;
      }

      const response = await client.lang2Fhir.uploadProfile({
        profile: encodeProfile(profile),
        implementation_guide: options.implementationGuide,
        ...(options.profileContext ? { profile_context: options.profileContext } : {})
      });

      uploadedCount += 1;
      console.log(`[upload] ${response.id ?? profile.id} (${response.type ?? profile.type})`);
    } catch (error) {
      failedCount += 1;
      console.error(`[fail] ${source.jsonUrl}: ${getErrorMessage(error)}`);

      if (options.failFast) {
        throw error;
      }
    }
  }

  console.log(`Finished. Uploaded: ${uploadedCount}. Skipped: ${skippedCount}. Failed: ${failedCount}.`);

  if (failedCount > 0) {
    process.exitCode = 1;
  }
}

uploadQicoreProfiles().catch(error => {
  console.error(getErrorMessage(error));
  process.exitCode = 1;
});
