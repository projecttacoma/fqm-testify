export const EXAMPLE_DR_CHOICE_TYPE_PERIOD_TO_PERIOD = {
  type: 'Condition',
  dateFilter: [
    {
      path: 'onset',
      valuePeriod: {
        start: '2019-01-01T00:00:00.000Z',
        end: '2019-12-31T00:00:00.000Z'
      }
    }
  ]
};

export const EXAMPLE_DR_CHOICE_TYPE_DATETIME_TO_PERIOD = {
  type: 'Condition',
  dateFilter: [
    {
      path: 'onset',
      valueDateTime: '2019-01-01T00:00:00.000Z'
    }
  ]
};

export const EXAMPLE_DR_PERIOD_TO_DATETIME = {
  type: 'Condition',
  dateFilter: [
    {
      path: 'recordedDate',
      valuePeriod: {
        start: '2019-01-01T00:00:00.000Z',
        end: '2019-12-31T00:00:00.000Z'
      }
    }
  ]
};

export const EXAMPLE_DR_DATETIME_TO_DATETIME = {
  type: 'Condition',
  dateFilter: [
    {
      path: 'recordedDate',
      valueDateTime: '2019-01-01T00:00:00.000Z'
    }
  ]
};

export const EXAMPLE_DR_PERIOD_TO_DATE = {
  type: 'Patient',
  dateFilter: [
    {
      path: 'birthDate',
      valuePeriod: {
        start: '2019-01-01T00:00:00.000Z',
        end: '2019-12-31T00:00:00.000Z'
      }
    }
  ]
};

export const EXAMPLE_DR_DATETIME_TO_DATE = {
  type: 'Patient',
  dateFilter: [
    {
      path: 'birthDate',
      valueDateTime: '2019-01-01T00:00:00.000Z'
    }
  ]
};

export const EXAMPLE_DR_NO_DATEFILTER = {
  type: 'Condition'
};

export const EXAMPLE_DR_MULTIPLE_DATE_FILTERS = {
  type: 'Condition',
  dateFilter: [
    {
      path: 'onset',
      valuePeriod: {
        start: '2019-01-01T00:00:00.000Z',
        end: '2019-12-31T00:00:00.000Z'
      }
    },
    {
      path: 'recordedDate',
      valueDateTime: '2019-01-01T00:00:00.000Z'
    }
  ]
};
