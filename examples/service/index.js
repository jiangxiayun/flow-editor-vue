import appServer from '@/service/_axios'

const APIS = {
  // 获取流程图列表
  processessList: (params) => Promise.resolve(appServer.get('/app/rest/models', { params: params })),
  // 获取流程图数据
  editorJson: (id, params) => Promise.resolve(appServer.get(`/app/rest/models/${id}/editor/json`, { params: params })),

  getStencilSet: () => Promise.resolve(appServer.get('/app/rest/stencil-sets/editor')),

  getCmmnStencilSet: (params) => Promise.resolve(appServer.get('/app/rest/stencil-sets/cmmneditor', { params: params })),

  validateModel: (params) => Promise.resolve(appServer.get('/app/rest/model/validate', { params: params })),

  // 获取表单列表
  getFormModelsUrl: (params) => Promise.resolve(appServer.get('/app/rest/form-models', { params: params })),


  // 获取所有用户以及拥有角色
  // userList: (params) => Promise.resolve(appServer.post('/pdm/product/userRoleRelation/queryAllUserAndRole', {...params})),
}

export default APIS