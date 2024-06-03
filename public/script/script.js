function glpmScript() {
  const cardClassMap = {
    failed: 'glpm-failed-card text-white',
    success: 'glpm-success-card text-white',
    running: 'glpm-running-card text-white',
    _default: 'bg-light text-dark'
  };
  const runButton = document.getElementById('runBtn');
  const projectSelect = document.getElementById('projectSelect');
  const intervalSelect = document.getElementById('intervalSelect');
  const projectContainer = document.getElementById('project-container');
  const pipelinesContainer = document.getElementById('pipelines-container');
  const lastFetchedAt = document.getElementById('last-fetched-at');

  let intervalInstance;
  let projectsData = {};

  const timeAgo = timestamp => {
    const now = new Date();
    const past = new Date(timestamp);

    const seconds = Math.floor((now - past) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    if (years > 0) {
      return rtf.format(-years, 'year');
    } else if (months > 0) {
      return rtf.format(-months, 'month');
    } else if (weeks > 0) {
      return rtf.format(-weeks, 'week');
    } else if (days > 0) {
      return rtf.format(-days, 'day');
    } else if (hours > 0) {
      return rtf.format(-hours, 'hour');
    } else if (minutes > 0) {
      return rtf.format(-minutes, 'minute');
    } else {
      return rtf.format(-seconds, 'second');
    }
  };

  const formatSeconds = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const parts = [];
    if (minutes > 0) {
      parts.push(`${minutes}m`);
    }
    if (remainingSeconds > 0 || parts.length === 0) {
      parts.push(`${remainingSeconds}s`);
    }
    return parts.join(' ');
  };

  const getProjectDefaultBranchCardHtml = defaultBranch => {
    const cardClass = cardClassMap[defaultBranch.status] || cardClassMap._default;
    return `<div class="${cardClass} px-3 py-2 pipeline-card">
      ${defaultBranch.ref} 
      | #${defaultBranch.id} 
      | ${defaultBranch.sha.substring(0, 8)} 
      | finished <span title="${new Date(defaultBranch.updated_at).toUTCString()}">
                ${timeAgo(defaultBranch.updated_at)}
              </span>
      | <span title="Committer">${defaultBranch.user.name.substring(0, 30)}</span>
    </div>`;
  };

  const getPipelineCardHtml = pipelines => {
    return pipelines.map(p => {
      const cardClass = cardClassMap[p.status] || cardClassMap._default;
      const ranFor = ['success', 'failed'].includes(p.status)
        ? `<p class="card-subtitle">
            Ran for ${formatSeconds(p.duration)}
            and finished
            <span title="${new Date(p.updated_at).toUTCString()}">
              ${timeAgo(p.updated_at)}
            </span>
          </p>`
        : '<p class="card-subtitle">Ran for ...</p>';

      return `<div class='col-auto pipeline-card-container'>
        <div class="card ${cardClass} mb-4 pipeline-card">
          <div class="card-header">${p.ref}</div>
          <div class="card-body">
            <h5 class="card-title">${p.status}</h5>
            <p class="card-subtitle" title="Pipeline">
              <span title="Commit">${p.sha.substring(0, 8)}</span>
              <span class="float-end" title="Pipeline">#${p.id}</span>
            </p>
            <p class="card-subtitle" title="Committer">${p.user.name.substring(0, 30)}</p>
            ${ranFor}
          </div>
        </div>
      </div>`;
    });
  };

  const getProjects = async () => {
    const response = await fetch('/projects');
    const json = await response.json();
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
    const response = await fetch(`/projects/${selectedProjectId}/statuses`);
    const json = await response.json();
    if (json.status === 200) {
      projectContainer.innerHTML = getProjectDefaultBranchCardHtml(json.data.defaultBranchPipeline);
      pipelinesContainer.innerHTML = getPipelineCardHtml(json.data.pipelines).join('');
      lastFetchedAt.innerHTML = `<small>Last fetched at: ${new Date().toISOString()}</small>`;
    } else {
      // TODO: error case
    }
  };

  // run
  getProjects().catch(e => console.log(e));
  runButton.addEventListener('click', async () => {
    if (intervalInstance) {
      clearInterval(intervalInstance);
    }
    await getStatuses();
    intervalInstance = setInterval(
      async () => getStatuses(),
      parseInt(intervalSelect.value * 1000)
    );
  });
}

window.addEventListener(
  'DOMContentLoaded',
  function () {
    glpmScript();
  },
  false
);
