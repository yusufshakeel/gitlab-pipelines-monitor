function glpmScript() {
  const runButton = document.getElementById('runBtn');
  const projectSelect = document.getElementById('projectSelect');
  const interval = document.getElementById('intervalSelect');
  const pipelinesContainer = document.getElementById('pipelines-container');

  let projectsData = {};

  const getPipelineCardHtml = pipelines => {
    return pipelines.map(p => {
      const cardClassMap = {
        failed: 'bg-danger text-white',
        success: 'bg-success text-white',
        running: 'bg-primary text-white',
        _default: 'bg-light text-dark'
      };
      const cardClass = cardClassMap[p.status] || cardClassMap._default;

      return `<div class='col-auto pipeline-card-container'>
        <a href="${p.web_url}" class="card-link ${cardClass}" target="_blank">
            <div class="card ${cardClass} mb-3 pipeline-card">
                <div class="card-header">${p.status.toUpperCase()}</div>
                <div class="card-body">
                    <h5 class="card-title">${p.ref}</h5>
                    <h6 class="card-subtitle my-2 text-body-secondary">Pipeline: ${p.id}</h6>
                    <p class="card-text">Commit: ${p.sha.substring(0, 8)}</p>
                </div>
            </div>
        </a>
      </div>`;
    });
  };

  const getProjects = async () => {
    const response = await fetch('/projects');
    const json = await response.json();
    console.log(json);
    if (json.status === 200) {
      projectsData = { ...json.data };
      if (projectsData.projects.length === 0) {
        return;
      }
      const html = json.data.projects.map(p => {
        return `<option value="${p.id}" ${p.id === json.data.defaultProjectId ? 'selected' : ''}>${
          p.name
        }</option>`;
      });
      runButton.removeAttribute('disabled');
      projectSelect.innerHTML = html;
    } else {
      // TODO: error case
    }
  };

  const getStatuses = async () => {
    const selectedProjectId = projectSelect.value;
    console.log({ selectedProjectId });
    const response = await fetch(`/projects/${selectedProjectId}/statuses`);
    const json = await response.json();
    console.log(json);
    if (json.status === 200) {
      pipelinesContainer.innerHTML = getPipelineCardHtml(json.data.pipelines.all).join('');
    } else {
      // TODO: error case
    }
  };

  // run
  getProjects().catch(e => console.log(e));
  runButton.addEventListener('click', async () => {
    await getStatuses();
  });
}

window.addEventListener(
  'DOMContentLoaded',
  function () {
    glpmScript();
  },
  false
);
