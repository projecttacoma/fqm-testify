import { parsedPrimaryDatePaths } from 'fhir-spec-tools/build/data/primaryDatePaths';
import { format } from 'date-fns';
import { PrimaryDatePaths } from 'fhir-spec-tools';
import fhirpath from 'fhirpath';

const DEFAULT_PERIOD_LENGTH = 1;

export interface DateFieldInfo {
  isChoiceType?: boolean;
  dataTypes: string[];
}
export interface DateInfo {
  [dateField: string]: DateFieldInfo;
}

export interface DateFormatInfo {
  date: string;
  dateType: string;
  sortDate?: Date;
}

/**
 * Parses the primary date path info and populates date info to satisfy date filter specified in the passed-in data requirement
 * @param {Object} resource FHIR resource being created
 * @param {Object} dr a FHIR dataRequirement object
 * @param {String} mpStart the start of the specified measurement period
 * @param {String} mpEnd the end of the specified measurement period
 */
export function getResourcePrimaryDates(resource: any, dr: fhir4.DataRequirement, mpStart: string, mpEnd: string) {
  const rt = dr.type;
  const primaryDateInfo = parsedPrimaryDatePaths[rt];
  if (primaryDateInfo) {
    if (dr.dateFilter && dr.dateFilter.length > 0) {
      dr.dateFilter?.forEach(df => {
        // pull path off date filter
        const path = df.path?.split('.')[0] ?? '';
        // check if path exists on primary date info
        if (Object.keys(primaryDateInfo).includes(path)) {
          const fieldTypeInfo = primaryDateInfo[path];
          // check for allowed types for value with priority (Period => dateTime => date)
          const { validField, newPath } = getDateType(fieldTypeInfo, path);
          if (validField === 'Period') {
            if (df.valuePeriod) {
              // pick random 1-day period in period
              resource[newPath] = getRandomPeriodInPeriod(
                df.valuePeriod?.start ?? mpStart,
                df.valuePeriod?.end ?? mpEnd
              );
            } else if (df.valueDateTime) {
              // use dateTime as periodStart and periodEnd of resource
              resource[newPath] = { start: df.valueDateTime, end: df.valueDateTime };
            } else {
              // pick random period within the measurement period and make a 1-day period
              resource[newPath] = getRandomPeriodInPeriod(mpStart, mpEnd);
            }
          } else if (validField === 'dateTime') {
            if (df.valuePeriod) {
              // pick random dateTime within the period
              resource[newPath] = getRandomDateInPeriod(
                df.valuePeriod?.start ?? mpStart,
                df.valuePeriod?.end ?? mpEnd
              ).toISOString();
            } else if (df.valueDateTime) {
              // use valueDateTime
              resource[newPath] = df.valueDateTime;
            } else {
              // pick random dateTime within the measurement period
              resource[newPath] = getRandomDateInPeriod(mpStart, mpEnd).toISOString();
            }
          } else if (validField === 'date') {
            if (df.valuePeriod) {
              // pick random date in period
              const date = getRandomDateInPeriod(df.valuePeriod?.start ?? mpStart, df.valuePeriod?.end ?? mpEnd);
              resource[newPath] = jsDateToFHIRDate(date);
            } else if (df.valueDateTime) {
              // use valueDateTime and strip timezone
              resource[newPath] = jsDateToFHIRDate(new Date(df.valueDateTime));
            } else {
              //pick random date within the measurement period
              const date = getRandomDateInPeriod(mpStart, mpEnd);
              resource[newPath] = jsDateToFHIRDate(date);
            }
          }
        }
      });
      // If no date filters, fill all fields that can accept Period, dateTime, or date with valid entries in mp
    } else {
      Object.keys(primaryDateInfo).forEach(path => {
        const fieldTypeInfo = primaryDateInfo[path];
        const { validField, newPath } = getDateType(fieldTypeInfo, path);
        if (validField === 'Period') {
          resource[newPath] = getRandomPeriodInPeriod(mpStart, mpEnd);
        } else if (validField === 'dateTime') {
          resource[newPath] = getRandomDateInPeriod(mpStart, mpEnd).toISOString();
        } else {
          resource[newPath] = getRandomDateInPeriod(mpStart, mpEnd).toISOString();
        }
      });
    }
  }
}

/**
 * Determines the ideal date info type and path to populate a given attribute with date info
 * @param {Object} fieldTypeInfo object containing information on date types the specified field can accept
 * @param {String} path the attribute name that needs to be populated with date info
 * @returns {Object} an object containing the newPath to enter date info and the ideal date info type
 */
export function getDateType(fieldTypeInfo: DateFieldInfo, path: string): { validField: string; newPath: string } {
  let validField;
  let newPath = path;
  if (fieldTypeInfo.isChoiceType) {
    // prioritize date type Period > dateTime > date
    validField = fieldTypeInfo.dataTypes.reduce((acc: string, e: string) => {
      if (acc === 'Period' || e === 'Period') {
        return 'Period';
      } else if (e === 'dateTime') {
        return 'dateTime';
      }
      return acc;
    }, 'date');
    // for choiceTypes append the capitalized dateType to the field (ex. effectivePeriod)
    newPath = `${path}${validField.charAt(0).toUpperCase() + validField.slice(1)}`;
  } else {
    validField = fieldTypeInfo.dataTypes[0];
  }
  return { validField, newPath };
}

/**
 * Creates a JS date at a random time within the specified period
 * @param {String} start start date string for the period
 * @param {String} end end date string for the period
 * @returns {Date} a js date object within the specified period
 */
export function getRandomDateInPeriod(start: string, end: string): Date {
  const startDate = new Date(start);
  const endDate = new Date(end);
  endDate.setDate(endDate.getDate() - 1);

  const date = new Date(+startDate + Math.random() * (endDate.getTime() - startDate.getTime()));
  return date;
}

/**
 * Converts a JS date to a FHIR date string
 * @param {Date} date JS date to be converted
 * @returns {String} a string representing a FHIR date
 */
export function jsDateToFHIRDate(date: Date): string {
  const year = date.getFullYear();
  // month is 0 indexed
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
}

/**
 * Takes in the start and end points of a period and returns a FHIR Period that takes place within the specified dates
 * @param {string} start start date string for the period
 * @param {string} end end date string for the period
 * @returns {Object} a FHIR Period with length equal to the default period length that takes place within the passed-in period
 */
export function getRandomPeriodInPeriod(start: string, end: string): fhir4.Period {
  const periodStart = getRandomDateInPeriod(start, end);
  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodEnd.getDate() + DEFAULT_PERIOD_LENGTH);
  return {
    start: periodStart.toISOString(),
    end: periodEnd.toISOString()
  };
}

/**
 * Takes in resource and returns the date and dateType, formatted nicely (used in Resource Display cards), and sortDate (used for sorting).
 * If primary date is a period, date will be in format mm/dd/yyyy-mm/dd/yyyy, and sortDate is set to start (if available) by default
 * @param {fhir4.FhirResource} resource resource to have date formatted
 * @returns {Object} primary date formatting strings and sorting date
 */
export function dateForResource(resource: fhir4.FhirResource): DateFormatInfo {
  const dateInfo = PrimaryDatePaths.parsedPrimaryDatePaths[resource.resourceType];
  if (!resource || !PrimaryDatePaths?.parsedPrimaryDatePaths || !dateInfo) {
    return {
      date: 'N/A',
      dateType: 'N/A'
    };
  }

  for (const nameOfResourceDate of Object.keys(dateInfo)) {
    // If only one dataType
    const resourceDateData = fhirpath.evaluate(resource, nameOfResourceDate)[0];
    if (dateInfo[nameOfResourceDate].dataTypes.length === 1 && resourceDateData) {
      // If the only dataType is a period
      if (dateInfo[nameOfResourceDate].dataTypes[0] === 'Period') {
        return formatPeriod(resource, nameOfResourceDate, nameOfResourceDate);
      }
      // If the only dataType is either dateTime or date
      else {
        return {
          date: formatDate(fhirpath.evaluate(resource, nameOfResourceDate)[0]),
          dateType: nameOfResourceDate,
          sortDate: new Date(fhirpath.evaluate(resource, nameOfResourceDate)[0])
        };
      }
    }

    // If isChoiceType is true
    else {
      for (const dataType of dateInfo[nameOfResourceDate].dataTypes) {
        // Capitalize the first char of dataType and append for proper resource date name
        const fullResourceDateName = nameOfResourceDate + dataType.charAt(0).toUpperCase() + dataType.slice(1);
        if (fhirpath.evaluate(resource, fullResourceDateName)[0]) {
          if (dataType === 'Period') {
            return formatPeriod(resource, fullResourceDateName, fullResourceDateName);
          }
          // Else if dataType === 'dateTime' || 'Date'
          else {
            return {
              date: formatDate(fhirpath.evaluate(resource, fullResourceDateName)[0]),
              dateType: fullResourceDateName,
              sortDate: new Date(fhirpath.evaluate(resource, fullResourceDateName)[0])
            };
          }
        }
      }
    }
  }
  return {
    date: 'N/A',
    dateType: 'N/A'
  };
}

// Helper Function: Formatter for if the date is a period
const formatPeriod = (resource: fhir4.FhirResource, resourcePeriod: string, dateTypeName: string) => {
  const startTime = fhirpath.evaluate(resource, resourcePeriod + '.start')[0];
  const endTime = fhirpath.evaluate(resource, resourcePeriod + '.end')[0];
  return {
    date: formatDate(startTime) + '-' + formatDate(endTime),
    dateType: dateTypeName,
    sortDate: startTime ? new Date(startTime) : new Date(endTime)
  };
};

// Helper Function: Using date-fns to format (other date formats available)
const formatDate = (dateString: string) => {
  const formattedDate = format(new Date(dateString), 'MM/DD/YYYY');
  if (formattedDate === 'Invalid Date') {
    return 'N/A';
  }
  return formattedDate;
};
