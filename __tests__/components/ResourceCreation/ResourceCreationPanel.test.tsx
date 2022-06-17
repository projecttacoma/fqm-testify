import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mantineRecoilWrap } from '../../helpers/testHelpers';
import React from 'react';
import ResourceCreationPanel from '../../../components/ResourceCreation/ResourceCreationPanel';

describe('ResourceCreationPanel', () => {
  it('should render a create test patient button', () => {
    render(
      mantineRecoilWrap(
        <>
          <ResourceCreationPanel />
        </>
      )
    );

    const button = screen.getByText(/Create Test Patient/i);
    expect(button).toBeInTheDocument();
  });
});
