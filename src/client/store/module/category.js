import { log } from '../../helper/logger';
import config from '../../config';

const CATEGORY_FETCH = 'categories:fetch';
const CATEGORY_SET = 'categories:set';
const CATEGORY_ARTICLES_SET = 'categories:articles:set';
const CATEGORY_SET_ARTICLE_PARAM = 'categories:article:params:set';

const { path } = config;

const category = {
  state: {
    categories: {},
    articleParam: null,
  },
  getters: {
    categories: state => state.categories,
  },
  mutations: {
    [CATEGORY_ARTICLES_SET]: (state, articles) => {
      Object.keys(articles).forEach((id) => {
        state.categories[id].articles = articles[id];
      });
    },
    [CATEGORY_SET_ARTICLE_PARAM]: (state, param) => {
      state.articleParam = param;
    },
  },
  actions: {
    [CATEGORY_SET]: ({ state, getters }, categories) => {
      Object.keys(categories).forEach((id) => {
        const articles = state.categories[id] && state.categories[id].articles;
        if (!state.categories[id]) {
          state.categories[id] = categories[id];
        } else {
          Object.keys(categories[id]).forEach((key) => {
            state.categories[id][key] = categories[id][key];
          });
        }
        state.categories[id].articles = articles || [];
        state.categories[id].url = getters.isPublish
          ? `/category/${id}` : `${path.user}/category/${id}`;
      });
    },
    [CATEGORY_FETCH]: async ({
      commit, state, getters, dispatch,
    }, {
        id, depth = 0, currentDepth = 0, article = '0,0',
      }) => {
      // console.log(state.articleParam, article)
      if (!(id in state.categories) || state.articleParam !== article) {
        commit(CATEGORY_SET_ARTICLE_PARAM, article);
        try {
          dispatch(CATEGORY_SET, { [id]: { articles: [] } });
          const promises = [];
          promises.push(getters.Category.get(id).then((res) => {
            dispatch(CATEGORY_SET, { [id]: res.data });
          }));

          // get category articles
          const [from, size] = String(article).split(',').map(item => +item);
          if (size) {
            const params = { category_id: id };
            if (size !== -1) {
              params._from = from;
              params._size = size;
            }
            promises.push(getters.Article.query(params).then((res) => {
              const categoryArticles = res.data.items;
              categoryArticles.forEach((categoryArticle) => {
                categoryArticle.url = getters.isPublish
                  ? `/article/${categoryArticle.id}` : `${path.user}/article/${categoryArticle.id}`;
              });
              commit(CATEGORY_ARTICLES_SET, { [id]: categoryArticles });
            }));
          }

          // get sub categories
          if (currentDepth < depth) {
            const res = await getters.Category.query({ parent_id: id });
            res.data.items.forEach((item) => {
              promises.push(dispatch(CATEGORY_FETCH, {
                id: item.id, currentDepth: currentDepth + 1, depth, article,
              }));

              if (!state.categories[id].children) {
                state.categories[id].children = [];
              }
              state.categories[id].children.push(state.categories[item.id]);
            });
          }
          await Promise.all(promises);
        } catch (e) {
          log(e);
          log(`category id=${id} not found`);
        }
      }
    },
  },
};

export {
  CATEGORY_FETCH,
  category,
};
