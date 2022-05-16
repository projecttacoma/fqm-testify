import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mantineRecoilWrap } from '../helpers/testHelpers';
import AbacusHeader from '../../components/AbacusHeader';

describe('AbacusHeader', () => {
  it('renders a heading with title and theme switcher', () => {
    render(mantineRecoilWrap(<AbacusHeader />));

    const heading = screen.getByRole('heading', {
      name: /FQM Testify: an ECQM Analysis Tool/i
    });
    expect(heading).toBeInTheDocument();

    const themeSwitch = screen.getByRole('button');
    expect(themeSwitch).toBeInTheDocument();
  });
});
