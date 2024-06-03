'use strict';

const ProjectService = require('../../../../src/services/project-service');
const projectController = require('../../../../src/controllers/project-controller');

jest.mock('../../../../src/services/project-service');

describe('projectController', () => {
  let controller;
  let config;

  beforeEach(() => {
    config = {
      projects: {
        ['default']: 'project1',
        project1: {
          projectId: '1',
          projectName: 'Project One',
          projectUrl: 'http://project.one'
        },
        project2: {
          projectId: '2',
          projectName: 'Project Two',
          projectUrl: 'http://project.two'
        }
      },
      api: {
        apiEndpoint: 'http://api.endpoint',
        timeout: 10000
      }
    };

    const mockProjectService = {
      getProjects: jest.fn(),
      getStatuses: jest.fn()
    };

    ProjectService.mockReturnValue(mockProjectService);

    controller = projectController({ config });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjects', () => {
    it('should return 200 and project data on success', async () => {
      const mockGetProjects = ProjectService().getProjects;
      mockGetProjects.mockResolvedValue({
        defaultProjectId: 'project1',
        projects: [
          { id: '1', name: 'Project One', url: 'http://project.one' },
          { id: '2', name: 'Project Two', url: 'http://project.two' }
        ]
      });

      const result = await controller.getProjects();
      expect(result).toEqual({
        status: 200,
        data: {
          defaultProjectId: 'project1',
          projects: [
            { id: '1', name: 'Project One', url: 'http://project.one' },
            { id: '2', name: 'Project Two', url: 'http://project.two' }
          ]
        }
      });
      expect(mockGetProjects).toHaveBeenCalledTimes(1);
    });

    it('should return 400 and error message on failure', async () => {
      const mockGetProjects = ProjectService().getProjects;
      mockGetProjects.mockRejectedValue(new Error('Failed to get projects'));

      const result = await controller.getProjects();
      expect(result).toEqual({
        status: 400,
        error: { message: 'Failed to get projects' }
      });
      expect(mockGetProjects).toHaveBeenCalledTimes(1);
    });
  });

  describe('getStatuses', () => {
    it('should return 200 and statuses on success', async () => {
      const mockGetStatuses = ProjectService().getStatuses;
      mockGetStatuses.mockResolvedValue({
        project: {
          id: '1',
          name: 'Project One',
          url: 'http://project.one'
        },
        defaultBranchPipeline: { id: 101, status: 'success' },
        pipelines: [{ id: 101, status: 'success' }]
      });

      const result = await controller.getStatuses('project1');
      expect(result).toEqual({
        status: 200,
        data: {
          project: {
            id: '1',
            name: 'Project One',
            url: 'http://project.one'
          },
          defaultBranchPipeline: { id: 101, status: 'success' },
          pipelines: [{ id: 101, status: 'success' }]
        }
      });
      expect(mockGetStatuses).toHaveBeenCalledWith('project1');
      expect(mockGetStatuses).toHaveBeenCalledTimes(1);
    });

    it('should return 400 and error message on failure', async () => {
      const mockGetStatuses = ProjectService().getStatuses;
      mockGetStatuses.mockRejectedValue(new Error('Failed to get statuses'));

      const result = await controller.getStatuses('project1');
      expect(result).toEqual({
        status: 400,
        error: { message: 'Failed to get statuses' }
      });
      expect(mockGetStatuses).toHaveBeenCalledWith('project1');
      expect(mockGetStatuses).toHaveBeenCalledTimes(1);
    });
  });
});
