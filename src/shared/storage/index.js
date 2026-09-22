const SCHEMA_VERSION = 1;

const DEFAULT_SETTINGS = {
  language: 'system',
  autoHighlight: true,
  absoluteUrls: true,
  maxPreviewRows: 25,
  confirmDelete: true
};

const DEFAULT_DATA = {
  schemaVersion: SCHEMA_VERSION,
  settings: DEFAULT_SETTINGS,
  projects: {},
  recentSelectors: []
};

// Memory fallback for development/tests
const memoryStore = { ...DEFAULT_DATA };

function hasChromeStorage() {
  return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
}

/**
 * Load entire store or default
 */
export async function getStore() {
  if (hasChromeStorage()) {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (data) => {
        if (!data || Object.keys(data).length === 0) {
          chrome.storage.local.set(DEFAULT_DATA, () => resolve(DEFAULT_DATA));
        } else {
          // Check schema version migration if needed
          if (!data.schemaVersion) {
            data.schemaVersion = SCHEMA_VERSION;
            chrome.storage.local.set(data);
          }
          resolve({
            ...DEFAULT_DATA,
            ...data,
            settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) }
          });
        }
      });
    });
  }
  return Promise.resolve(memoryStore);
}

/**
 * Get current settings
 */
export async function getSettings() {
  const store = await getStore();
  return store.settings || DEFAULT_SETTINGS;
}

/**
 * Update settings
 */
export async function saveSettings(partial) {
  const store = await getStore();
  const updatedSettings = { ...store.settings, ...partial };
  store.settings = updatedSettings;

  if (hasChromeStorage()) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ settings: updatedSettings }, () => resolve(updatedSettings));
    });
  }
  memoryStore.settings = updatedSettings;
  return updatedSettings;
}

/**
 * Get projects for a specific domain or all
 */
export async function getProjects(domain = null) {
  const store = await getStore();
  const projects = store.projects || {};
  if (domain) {
    return projects[domain] || [];
  }
  return projects;
}

/**
 * Save or update a project
 */
export async function saveProject(domain, project) {
  const store = await getStore();
  const domainProjects = store.projects[domain] || [];
  
  const existingIdx = domainProjects.findIndex((p) => p.id === project.id);
  const updatedProject = {
    ...project,
    updatedAt: Date.now(),
    createdAt: project.createdAt || Date.now()
  };

  let newDomainProjects;
  if (existingIdx >= 0) {
    newDomainProjects = [...domainProjects];
    newDomainProjects[existingIdx] = updatedProject;
  } else {
    newDomainProjects = [updatedProject, ...domainProjects];
  }

  const newProjects = {
    ...store.projects,
    [domain]: newDomainProjects
  };

  store.projects = newProjects;

  if (hasChromeStorage()) {
    await new Promise((resolve) => chrome.storage.local.set({ projects: newProjects }, resolve));
  } else {
    memoryStore.projects = newProjects;
  }

  return updatedProject;
}

/**
 * Delete a project
 */
export async function deleteProject(domain, projectId) {
  const store = await getStore();
  const domainProjects = store.projects[domain] || [];
  const filtered = domainProjects.filter((p) => p.id !== projectId);

  const newProjects = {
    ...store.projects,
    [domain]: filtered
  };

  if (hasChromeStorage()) {
    await new Promise((resolve) => chrome.storage.local.set({ projects: newProjects }, resolve));
  } else {
    memoryStore.projects = newProjects;
  }

  return true;
}

/**
 * Get recent selectors
 */
export async function getRecentSelectors() {
  const store = await getStore();
  return store.recentSelectors || [];
}

/**
 * Add a recent selector (max 50)
 */
export async function addRecentSelector(selector, type = 'Selector') {
  if (!selector || typeof selector !== 'string') return;
  
  const store = await getStore();
  const current = store.recentSelectors || [];
  
  // Filter out if already present to put it at the top
  const filtered = current.filter((item) => item.selector !== selector);
  const newItem = {
    id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    selector,
    type,
    timestamp: Date.now()
  };

  const updated = [newItem, ...filtered].slice(0, 50);
  store.recentSelectors = updated;

  if (hasChromeStorage()) {
    await new Promise((resolve) => chrome.storage.local.set({ recentSelectors: updated }, resolve));
  } else {
    memoryStore.recentSelectors = updated;
  }

  return updated;
}

/**
 * Clear all recent selectors
 */
export async function clearRecentSelectors() {
  const store = await getStore();
  store.recentSelectors = [];

  if (hasChromeStorage()) {
    await new Promise((resolve) => chrome.storage.local.set({ recentSelectors: [] }, resolve));
  } else {
    memoryStore.recentSelectors = [];
  }

  return [];
}
