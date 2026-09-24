export { api, ApiClientError } from "./client.js";
export { categoryApi } from "./categoryApi.js";
export { subcategoryApi } from "./subcategoryApi.js";
export { collectionApi } from "./collectionApi.js";
export { productApi } from "./productApi.js";
export { tagApi } from "./tagApi.js";
export { mediaApi } from "./mediaApi.js";
export { attributeApi } from "./attributeApi.js";
export { storefrontApi } from "./storefrontApi.js";
export { cmsApi } from "./cmsApi.js";
export { authApi } from "./authApi.js";
export { adminApi } from "./adminApi.js";

export default {
  category: categoryApi,
  subcategory: subcategoryApi,
  collection: collectionApi,
  product: productApi,
  tag: tagApi,
  media: mediaApi,
  attribute: attributeApi,
  storefront: storefrontApi,
  cms: cmsApi,
  auth: authApi,
  admin: adminApi,
};

