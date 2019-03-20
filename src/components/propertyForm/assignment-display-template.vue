<template>
  <label>
    <!--<span>{{property}}</span>-->
    <span>{{showText}}</span>
  </label>
</template>

<script>
  export default {
    name: 'assignment-display-template',
    props: {
      property: {
        type: Object,
        default: function () {
          return {
            value: {
              assignment: {},
              idm: {}
            }
          }
        }
      }
    },
    computed: {
      showText () {
        let value = this.property.value
        if (!value || !value.assignment) return this.$t('PROPERTY.ASSIGNMENT.EMPTY')

        if (value.assignment.type !== 'idm') {
          if (!value.assignment.assignee &&
            (!value.assignment.candidateUsers || value.assignment.candidateUsers.length === 0) &&
            (!value.assignment.candidateGroups || value.assignment.candidateGroups.length === 0)) {
            return this.$t('PROPERTY.ASSIGNMENT.EMPTY')
            // 没有选择分配人
          }

          if (value.assignment.assignee) {
            // 分配人
            return this.$t('PROPERTY.ASSIGNMENT.ASSIGNEE_DISPLAY', {assignee: value.assignment})
          }
          if (value.assignment.candidateUsers.length > 0) {
            // 候选用户
            return this.$t('PROPERTY.ASSIGNMENT.CANDIDATE_USERS_DISPLAY', {length: value.assignment.candidateUsers.length})
          }
          if (value.assignment.candidateGroups.length > 0) {
            // 候选组
            return this.$t('PROPERTY.ASSIGNMENT.CANDIDATE_GROUPS_DISPLAY', {length: value.assignment.candidateGroups.length})
          }
        } else if (value.assignment.type === 'idm') {
          if (value.assignment.idm.assignee) {
            if (value.assignment.idm.assignee.id) {
              // 用户
              return this.$t('PROPERTY.ASSIGNMENT.USER_IDM_DISPLAY', {
                firstName: value.assignment.idm.assignee.firstName,
                lastName: value.assignment.idm.assignee.lastName
              })
            } else {
              return this.$t('PROPERTY.ASSIGNMENT.USER_IDM_EMAIL_DISPLAY', {email: value.assignment.idm.assignee.email})
            }
          }

          if (value.assignment.idm.assigneeField && value.assignment.idm.assigneeField.id) {
            return this.$t('PROPERTY.ASSIGNMENT.USER_IDM_FIELD_DISPLAY', {name: value.assignment.idm.assigneeField.name})
          }

          if (value.assignment.idm.candidateUsers &&
            value.assignment.idm.candidateUsers.length > 0 &&
            (!value.assignment.idm.candidateUserFields || value.assignment.idm.candidateUserFields.length === 0)) {
            return this.$t('PROPERTY.ASSIGNMENT.CANDIDATE_USERS_DISPLAY', {length: value.assignment.idm.candidateUsers.length})
          }

          if (value.assignment.idm.candidateGroups && value.assignment.idm.candidateGroups.length > 0
            && (!value.assignment.idm.candidateGroupFields || value.assignment.idm.candidateGroupFields.length === 0)) {
            return this.$t('PROPERTY.ASSIGNMENT.CANDIDATE_GROUPS_DISPLAY', {length: value.assignment.idm.candidateGroups.length})
          }

          if (value.assignment.idm.candidateUserFields && value.assignment.idm.candidateUserFields.length > 0) {
            // 候选用户
            if ((!value.assignment.idm.candidateUsers || value.assignment.idm.candidateUsers.length === 0)) {
              return this.$t('PROPERTY.ASSIGNMENT.CANDIDATE_USERS_DISPLAY', {
                length: value.assignment.idm.candidateUserFields.length
              })
            } else if (value.assignment.idm.candidateUsers && value.assignment.idm.candidateUsers.length > 0) {
              return this.$t('PROPERTY.ASSIGNMENT.CANDIDATE_USERS_DISPLAY', {
                length: value.assignment.idm.candidateUserFields.concat(value.assignment.idm.candidateUsers).length
              })
            }
          }

          if (value.assignment.idm.candidateGroupFields && value.assignment.idm.candidateGroupFields.length > 0) {
            // 候选组
            if ((!value.assignment.idm.candidateGroups || value.assignment.idm.candidateGroups.length === 0)) {
              return this.$t('PROPERTY.ASSIGNMENT.CANDIDATE_GROUPS_DISPLAY', {
                length: value.assignment.idm.candidateGroupFields.length
              })
            } else if (value.assignment.idm.candidateGroups && value.assignment.idm.candidateGroups.length > 0) {
              return this.$t('PROPERTY.ASSIGNMENT.CANDIDATE_GROUPS_DISPLAY', {
                length: value.assignment.idm.candidateGroupFields.concat(value.assignment.idm.candidateGroups).length
              })
            }
          }

          if (!value.assignment.idm.assignee && !value.assignment.idm.assigneeField &&
            (!value.assignment.idm.candidateUserFields || value.assignment.idm.candidateUserFields.length == 0) &&
            (!value.assignment.idm.candidateGroups || value.assignment.idm.candidateGroups.length == 0) &&
            (!value.assignment.idm.candidateGroupFields || value.assignment.idm.candidateGroupFields.length == 0)) {
            // 流程发起人
            return this.$t('PROPERTY.ASSIGNMENT.IDM_EMPTY')
          }
        }
      }
    },
    methods: {
      showTextaa () {

      }
    }
  }
</script>

<style scoped>

</style>