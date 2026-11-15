import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/academyData.json');

function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { categories: [], videos: [], articles: [] };
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[academyController] Error reading academyData.json:', err);
    return { categories: [], videos: [], articles: [] };
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[academyController] Error writing academyData.json:', err);
  }
}

// =============================================================================
// PUBLIC APIS
// =============================================================================

export const getPublicCategories = async (req, res) => {
  try {
    const data = loadData();
    return res.json({ success: true, data: data.categories || [] });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve categories' });
  }
};

export const getPublicVideos = async (req, res) => {
  try {
    const data = loadData();
    let videos = data.videos || [];

    const { type, category, search, featured } = req.query;

    if (type) {
      videos = videos.filter((v) => v.type === type);
    }
    if (category && category !== 'All' && category !== 'All Videos') {
      videos = videos.filter((v) => (v.category || '').toLowerCase() === category.toLowerCase());
    }
    if (featured !== undefined) {
      const isFeat = featured === 'true';
      videos = videos.filter((v) => Boolean(v.isFeatured) === isFeat);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      videos = videos.filter((v) => {
        return (
          (v.title || '').toLowerCase().includes(q) ||
          (v.topic || '').toLowerCase().includes(q) ||
          (v.category || '').toLowerCase().includes(q) ||
          (Array.isArray(v.tags) && v.tags.some((t) => t.toLowerCase().includes(q)))
        );
      });
    }

    return res.json({ success: true, count: videos.length, data: videos });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve videos' });
  }
};

export const getPublicVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = loadData();
    const cleanId = String(id).toLowerCase().trim();

    const video = (data.videos || []).find(
      (v) => v.id.toLowerCase() === cleanId || (v.slug && v.slug.toLowerCase() === cleanId)
    );

    if (!video) {
      return res.status(404).json({ success: false, error: `Video '${id}' not found` });
    }

    return res.json({ success: true, data: video });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve video details' });
  }
};

export const getPublicArticles = async (req, res) => {
  try {
    const data = loadData();
    let articles = data.articles || [];

    const { category, search } = req.query;

    if (category && category !== 'All') {
      articles = articles.filter((a) => (a.category || '').toLowerCase() === category.toLowerCase());
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      articles = articles.filter(
        (a) =>
          (a.title || '').toLowerCase().includes(q) ||
          (a.excerpt || '').toLowerCase().includes(q) ||
          (a.category || '').toLowerCase().includes(q)
      );
    }

    return res.json({ success: true, count: articles.length, data: articles });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve articles' });
  }
};

export const getPublicArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const data = loadData();
    const cleanSlug = String(slug).toLowerCase().trim();

    const article = (data.articles || []).find(
      (a) => a.slug.toLowerCase() === cleanSlug || a.id.toLowerCase() === cleanSlug
    );

    if (!article) {
      return res.status(404).json({ success: false, error: `Article '${slug}' not found` });
    }

    return res.json({ success: true, data: article });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve article' });
  }
};

// =============================================================================
// ADMIN PROTECTED APIS
// =============================================================================

export const createAdminVideo = async (req, res) => {
  try {
    const { title, category, type = 'long', duration, videoUrl, description, topic } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Video title is required' });
    }

    const data = loadData();
    const newVideo = {
      id: `vid-${Date.now()}`,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      type: type || 'long',
      category: category || 'Health Insurance',
      topic: topic || category || 'Insurance Guide',
      duration: duration || (type === 'short' ? '0:50' : '10:00'),
      videoUrl: videoUrl || null,
      thumbnail: null,
      views: '1',
      viewsCount: 1,
      uploadDate: 'Just now',
      instructor: 'WHYINSURED Advisory Desk',
      isFeatured: false,
      isPublished: true,
      description: description || 'Educational insurance guidance by WHYINSURED specialists.',
      tags: [category || 'Insurance']
    };

    data.videos = [newVideo, ...(data.videos || [])];
    saveData(data);

    return res.status(201).json({ success: true, data: newVideo });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create video' });
  }
};

export const updateAdminVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const data = loadData();
    const idx = (data.videos || []).findIndex((v) => v.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    data.videos[idx] = { ...data.videos[idx], ...req.body, updatedAt: new Date().toISOString() };
    saveData(data);

    return res.json({ success: true, data: data.videos[idx] });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update video' });
  }
};

export const deleteAdminVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const data = loadData();
    const initialLen = (data.videos || []).length;
    data.videos = (data.videos || []).filter((v) => v.id !== id);

    if (data.videos.length === initialLen) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    saveData(data);
    return res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete video' });
  }
};

export const createAdminArticle = async (req, res) => {
  try {
    const { title, category, readingTime, excerpt, content } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Article title is required' });
    }

    const data = loadData();
    const newArticle = {
      id: `art-${Date.now()}`,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title,
      category: category || 'Policy Basics',
      readingTime: readingTime || '5 min read',
      publishedDate: 'Recently',
      author: 'WHYINSURED Editorial Team',
      excerpt: excerpt || title,
      content: content || 'Comprehensive insurance guidance by WHYINSURED.',
      isPublished: true
    };

    data.articles = [newArticle, ...(data.articles || [])];
    saveData(data);

    return res.status(201).json({ success: true, data: newArticle });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create article' });
  }
};

export const deleteAdminArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const data = loadData();
    data.articles = (data.articles || []).filter((a) => a.id !== id && a.slug !== id);
    saveData(data);
    return res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete article' });
  }
};

