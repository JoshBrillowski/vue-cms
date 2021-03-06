import config from '../config';

// client config
const rnames = {
  admin: 'admin',
  category: 'category',
  categoryList: 'categoryList',
  article: 'article',
  articleList: 'articleList',
  publish: 'publish',
  login: 'login',
  index: 'index',
  list: 'list',
  detail: 'detail',
  user: 'user',
  common: 'common',
};

// site info
const brand = {
  name: 'vue-cms',
  router: {
    name: rnames.categoryList,
  },
};

const menu = [
  {
    label: 'Common',
    icon: 'cog',
    router: {
      name: rnames.common,
      params: {},
    },
  },
  {
    label: 'Category',
    icon: 'list',
    router: {
      name: rnames.categoryList,
      params: {},
    },
  },
  {
    icon: 'cloud-upload',
    router: {
      name: rnames.publish,
      params: {},
    },
  },
];

// path
const path = {
  user: config.server.path.user,
  admin: config.server.path.admin,
};

// db
const { db } = config;
db.rootId = 1;

// theme
const { theme } = config;

export default {
  path, db, brand, rnames, menu, theme,
};
