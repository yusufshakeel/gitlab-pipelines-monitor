'use strict';
const { displayPipelineStatus } = require('../../../../src/helpers/display-pipeline-status-helper');
const { Table } = require('console-table-printer');

jest.mock('console-table-printer', () => {
  const addRow = jest.fn();
  const printTable = jest.fn();
  return {
    Table: jest.fn(() => ({
      addRow,
      printTable
    }))
  };
});

describe('displayPipelineStatus', () => {
  let tableInstance;
  const mockTable = () => {
    tableInstance = new Table();
    tableInstance.addRow.mockClear();
    tableInstance.printTable.mockClear();
  };

  beforeEach(() => {
    mockTable();
  });

  test('should correctly set up the table and add rows', () => {
    const mockData = {
      project: {
        projectId: 123,
        projectName: 'Test Project',
        projectUrl: 'http://example.com',
        defaultBranch: 'main'
      },
      defaultBranchPipeline: {
        status: 'success',
        sha: 'abcdef1234567890',
        id: 456,
        updated_at: '2023-06-01T12:34:56Z',
        user: {
          name: 'Yusuf Shakeel'
        }
      },
      pipelines: [
        {
          updated_at: '2023-05-01T12:34:56Z',
          id: 789,
          sha: 'ghijklm1234567890',
          status: 'failed',
          ref: 'feature/test-feature',
          user: {
            name: 'Yusuf Shakeel'
          }
        },
        {
          updated_at: '2023-06-01T12:34:56Z',
          id: 101,
          sha: 'nopqrst1234567890',
          status: 'running',
          ref: 'bugfix/fix-bug',
          user: {
            name: 'Yusuf Shakeel'
          }
        }
      ]
    };

    displayPipelineStatus(mockData);

    expect(Table).toHaveBeenCalledWith({
      title:
        '\nPROJECT: (Id: 123) Test Project\n' +
        'Url: http://example.com\n' +
        'DEFAULT BRANCH: main\n' +
        'Status: SUCCESS | ' +
        'Commit: abcdef12 | ' +
        'Pipeline: 456 | ' +
        'UpdatedAt: 01 Jun 2023, 18:04:56\n',
      columns: [
        { name: 'UpdatedAt', alignment: 'left' },
        { name: 'Pipeline', alignment: 'left' },
        { name: 'Commit', alignment: 'left' },
        { name: 'Status', alignment: 'left' },
        { name: 'Branch', alignment: 'left' },
        { name: 'Committer', alignment: 'left' }
      ],
      colorMap: {
        custom_red_color: '\x1b[1;97m\x1b[41m'
      }
    });

    expect(tableInstance.addRow).toHaveBeenCalledTimes(2);
    expect(tableInstance.addRow).toHaveBeenCalledWith(
      {
        UpdatedAt: '01 May 2023, 18:04:56',
        Pipeline: 789,
        Commit: 'ghijklm12',
        Status: 'FAILED',
        Branch: 'feature/test-feature',
        Committer: 'Yusuf Shakeel'
      },
      { color: 'custom_red_color' }
    );
    expect(tableInstance.addRow).toHaveBeenCalledWith(
      {
        UpdatedAt: '01 Jun 2023, 18:04:56',
        Pipeline: 101,
        Commit: 'nopqrst12',
        Status: 'RUNNING',
        Branch: 'bugfix/fix-bug',
        Committer: 'Yusuf Shakeel'
      },
      { color: 'cyan' }
    );

    expect(tableInstance.printTable).toHaveBeenCalled();
  });
});
