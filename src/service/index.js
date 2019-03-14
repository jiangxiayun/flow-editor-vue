import appServer from '@/service/_axios'

const APIS = {
  // 获取所有角色列表
  roleList: (params) => Promise.resolve(appServer.post('/pdm/product/roleBrandRelation/queryAllRoleAndBrand', {...params})),
  // 获取所有用户以及拥有角色
  userList: (params) => Promise.resolve(appServer.post('/pdm/product/userRoleRelation/queryAllUserAndRole', {...params})),
  // 新增用户-角色关系
  userAndRole: (params) => Promise.resolve(appServer.post('/pdm/product/userRoleRelation/insert', {...params})),
  // 修改用户-角色关系
  userSetRole: (params) => Promise.resolve(appServer.post('/pdm/product/userRoleRelation/update', {...params})),
  // 新增角色-品牌关系
  roleAndBrand: (params) => Promise.resolve(appServer.post('/pdm/product/role/insert', {...params})),
  // 修改角色-品牌关系
  roleSetBrand: (params) => Promise.resolve(appServer.post('/pdm/product/role/update', {...params})),
  // 删除角色
  roleDelete: (params) => Promise.resolve(appServer.post('/pdm/product/role/delete', {...params}))
}

export default APIS