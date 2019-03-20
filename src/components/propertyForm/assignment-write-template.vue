<template>
  <DialogWrapper
      visible
      :property="property"
      :modal-append-to-body="false"
      @cancelHandle="close"
      @saveHandle="save"
      width="60%">
    <div class="modal-body">
      <div class="detail-group clearfix">
        <div class="form-group clearfix">
          <div class="col-xs-12">
            <label class="col-xs-4">{{$t('PROPERTY.ASSIGNMENT.TYPE')}}</label>

            <div class="col-xs-8">
              <div class="btn-group btn-group-justified">
                <div class="btn-group">
                  <el-radio v-model="popup.assignmentObject.type" label="idm" border>
                    {{$t('PROPERTY.ASSIGNMENT.TYPE.IDENTITYSTORE')}}
                  </el-radio>
                </div>
                <div class="btn-group">
                  <el-radio v-model="popup.assignmentObject.type" label="static" border>
                    {{$t('PROPERTY.ASSIGNMENT.TYPE.STATIC')}}
                  </el-radio>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!--固定值-->
        <div v-show="popup.assignmentObject.type != 'idm'">
          <div class="form-group clearfix" >
            <div class="col-xs-12">
              <label>{{$t('PROPERTY.ASSIGNMENT.ASSIGNEE')}}</label>
            </div>
            <div class="col-xs-12">
              <input type="text" id="assigneeField" class="form-control"
                     v-model="popup.assignmentObject.static.assignee"
                     :placeholder="$t('PROPERTY.ASSIGNMENT.ASSIGNEE_PLACEHOLDER')"/>
            </div>
          </div>

          <div class="form-group clearfix">
            <div class="col-xs-12">
              <label>{{$t('PROPERTY.ASSIGNMENT.CANDIDATE_USERS')}}</label>
            </div>
            <div class="col-xs-12"
                 v-for="(candidateUser, index) in popup.assignmentObject.static.candidateUsers"
                 :key="candidateUser.id">
              <input id="userField" class="form-control" type="text" v-model="candidateUser.value"/>
              <i v-if="popup.assignmentObject.static.candidateUsers.length >1"
                 class="glyphicon glyphicon-minus clickable-property"
                 @click="removeCandidateUserValue(index)"></i>
              <i v-if="index == (popup.assignmentObject.static.candidateUsers.length - 1)"
                 class="glyphicon glyphicon-plus clickable-property"
                 @click="addCandidateUserValue(index)"></i>
            </div>
          </div>

          <div class="form-group clearfix">
            <div class="col-xs-12">
              <label>{{$t('PROPERTY.ASSIGNMENT.CANDIDATE_GROUPS')}}</label>
            </div>
            <div class="col-xs-12"
                 v-for="(candidateGroup, index) in popup.assignmentObject.static.candidateGroups"
                 :key="index">
              <input id="groupField" class="form-control" type="text" v-model="candidateGroup.value"/>
              <i v-if="popup.assignmentObject.static.candidateGroups.length >1"
                 class="glyphicon glyphicon-minus clickable-property"
                 @click="removeCandidateGroupValue(index)"></i>
              <i v-if="index == (popup.assignmentObject.static.candidateGroups.length - 1)"
                 class="glyphicon glyphicon-plus clickable-property"
                 @click="addCandidateGroupValue(index)"></i>
            </div>
          </div>
        </div>

        <!--身份存储-->
        <div v-show="popup.assignmentObject.type == 'idm'">
          <div class="form-group clearfix">
            <div class="col-xs-12">
              <div class="col-xs-4">
                <label>{{$t('PROPERTY.ASSIGNMENT.IDM.TYPE')}}</label>
              </div>
              <div class="col-xs-8">
                <div class="btn-group span">
                  <select v-model="assignmentOption">
                    <option v-for="option in assignmentOptions" :key="option.id" :value="option">
                      {{option.title}}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="form-group clearfix" v-if="assignmentOption.id == 'user'">
            <div class="col-xs-12">
              <div class="col-xs-4">
                <label>{{$t('PROPERTY.ASSIGNMENT.ASSIGNEE')}}</label>
              </div>
              <div class="col-xs-8">
                <i class="icon icon-user"></i>
                <el-select
                    key="user"
                    v-model="popup.assignmentObject.idm.assignee"
                    value-key="id"
                    filterable
                    remote
                    :placeholder="$t('PROPERTY.ASSIGNMENT.PLACEHOLDER-SEARCHUSER')"
                    :no-match-text="$t('GENERAL.MESSAGE.PEOPLE-NO-MATCHING-RESULTS')"
                    :remote-method="remoteMethod"
                    :loading="userLoadong">
                  <el-option
                      v-for="item in userResults"
                      :key="item.id"
                      :label="item.fullName"
                      :value="item">
                  </el-option>
                </el-select>

                <div v-if="assignmentOption.id == 'user' && !popup.assignmentObject.idm.assignee">
                  {{$t('PROPERTY.ASSIGNMENT.NONE')}}</div>
              </div>
            </div>
          </div>

          <div class="form-group clearfix" v-if="assignmentOption.id == 'users'">
            <div class="col-xs-12">
              <div class="col-xs-4">
                <label>{{$t('PROPERTY.ASSIGNMENT.ASSIGNEE')}}</label>
              </div>
              <div class="col-xs-8">
                <i class="icon icon-user"></i>
                <el-select
                    key="users"
                    v-model="popup.assignmentObject.idm.candidateUsers"
                    value-key="id"
                    multiple
                    filterable
                    remote
                    reserve-keyword
                    :placeholder="$t('PROPERTY.ASSIGNMENT.PLACEHOLDER-SEARCHUSER')"
                    :no-match-text="$t('GENERAL.MESSAGE.PEOPLE-NO-MATCHING-RESULTS')"
                    :remote-method="remoteMethod"
                    :loading="userLoadong">
                  <el-option
                      v-for="item in userResults"
                      :key="item.id"
                      :label="item.fullName"
                      :value="item">
                  </el-option>
                </el-select>
                <div class="no-results"
                     v-if="assignmentOption.id == 'users' && (!popup.assignmentObject.idm.candidateUsers ||
                     !popup.assignmentObject.idm.candidateUsers.length)">
                  {{$t('PROPERTY.ASSIGNMENT.IDM.NO_CANDIDATE_USERS')}}
                </div>
              </div>
            </div>
          </div>

          <div class="form-group clearfix" v-if="assignmentOption.id == 'groups' &&
          (!popup.assignmentObject.assignmentSourceType || popup.assignmentObject.assignmentSourceType == 'search') ">
            <div class="col-xs-12">
              <div class="col-xs-4">
                <label>{{$t('PROPERTY.ASSIGNMENT.ASSIGNEE')}}</label>
              </div>
              <div class="col-xs-8">
                <el-select
                    v-model="popup.assignmentObject.idm.candidateGroups"
                    value-key="id"
                    multiple
                    filterable
                    remote
                    reserve-keyword
                    :placeholder="$t('PROPERTY.ASSIGNMENT.PLACEHOLDER-SEARCHGROUP')"
                    :no-match-text="$t('GENERAL.MESSAGE.GROUP-NO-MATCHING-RESULTS')"
                    :remote-method="remoteMethodGroup"
                    :loading="groupLoadong">
                  <el-option
                      v-for="group in groupResults"
                      :key="group.id"
                      :label="group.id"
                      :value="group">
                  </el-option>
                </el-select>
                <div class="no-results"
                     v-if="(!popup.assignmentObject.idm.candidateGroups ||
                     !popup.assignmentObject.idm.candidateGroups.length) &&
                     (!popup.assignmentObject.idm.candidateGroupFields ||
                     !popup.assignmentObject.idm.candidateGroupFields.length)">
                  {{$t('PROPERTY.ASSIGNMENT.IDM.NO_CANDIDATE_GROUPS')}}
                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="form-group clearfix">
          <div class="col-xs-12">
            <div class="col-xs-12">
              <label>
                <input type="checkbox" v-model="assignment.initiatorCanCompleteTask">
                &nbsp;{{$t('PROPERTY.ASSIGNMENT.INITIATOR-CAN-COMPLETE')}}
              </label>
            </div>
          </div>
        </div>
        popup： {{popup}}
      </div>
    </div>
  </DialogWrapper>

</template>

<script>
  import DialogWrapper from './DialogWrapper'
  const userList = require('@/mock/editor-users.json')
  const handleAssignmentInput = function ($assignment) {

    function isEmptyString (value) {
      return (value === undefined || value === null || value.trim().length === 0)
    }

    if (isEmptyString($assignment.assignee)) {
      $assignment.assignee = undefined
    }
    var toRemoveIndexes
    var removedItems = 0
    var i = 0
    if ($assignment.candidateUsers) {
      toRemoveIndexes = []
      for (let i = 0; i < $assignment.candidateUsers.length; i++) {
        if (isEmptyString($assignment.candidateUsers[i].value)) {
          toRemoveIndexes[toRemoveIndexes.length] = i
        }
      }

      if (toRemoveIndexes.length == $assignment.candidateUsers.length) {
        $assignment.candidateUsers = undefined
      } else {
        removedItems = 0
        for (let i = 0; i < toRemoveIndexes.length; i++) {
          $assignment.candidateUsers.splice(toRemoveIndexes[i] - removedItems, 1)
          removedItems++
        }
      }
    }

    if ($assignment.candidateGroups) {
      toRemoveIndexes = []
      for (let i = 0; i < $assignment.candidateGroups.length; i++) {
        if (isEmptyString($assignment.candidateGroups[i].value)) {
          toRemoveIndexes[toRemoveIndexes.length] = i
        }
      }

      if (toRemoveIndexes.length == $assignment.candidateGroups.length) {
        $assignment.candidateGroups = undefined
      } else {
        removedItems = 0
        for (let i = 0; i < toRemoveIndexes.length; i++) {
          $assignment.candidateGroups.splice(toRemoveIndexes[i] - removedItems, 1)
          removedItems++
        }
      }
    }
  }

  export default {
    name: 'assignment-write-template',
    data () {
      return {
        userLoadong: false,
        groupLoadong: false,
        groupResults: [],
        userResults: [],
        popup: {
          assignmentObject: {
            type: undefined,
            idm: {
              type: undefined,
              assignee: undefined,
              candidateUsers: [],
              candidateGroups: [],
              candidateUserFields: [],
              candidateGroupFields: []
            },
            static: {
              assignee: undefined,
              candidateUsers: [],
              candidateGroups: []
            }
          },
        },
        assignment: {
          initiatorCanCompleteTask: false
        },
        assignmentOption: {}
      }
    },
    props: {
      selectedShape: {
        type: Object,
        default: function () {
          return {}
        }
      },
      property: {
        type: Object,
        default: function () {
          return {}
        }
      }
    },
    components: { DialogWrapper },
    computed: {
      assignmentOptions () {
        return [
          { id: 'initiator', title: this.$t('PROPERTY.ASSIGNMENT.IDM.DROPDOWN.INITIATOR') },
          { id: 'user', title: this.$t('PROPERTY.ASSIGNMENT.IDM.DROPDOWN.USER') },
          { id: 'users', title: this.$t('PROPERTY.ASSIGNMENT.IDM.DROPDOWN.USERS') },
          { id: 'groups', title: this.$t('PROPERTY.ASSIGNMENT.IDM.DROPDOWN.GROUPS') }
        ]
      },
    },
    mounted () {
      this.defaultValue()
    },
    methods: {
      remoteMethod (query) {
        if (query !== '') {
          this.userLoadong = true;
          setTimeout(() => {
            this.userLoadong = false;
            this.userResults = userList.data.filter(item => {
              return item.fullName.toLowerCase()
                .indexOf(query.toLowerCase()) > -1;
            });
          }, 200);
        } else {
          this.userResults = [];
        }
      },
      remoteMethodGroup (query) {
        if (query !== '') {
          this.groupLoadong = true;
          setTimeout(() => {
            this.groupLoadong = false;
            this.groupResults = userList.data.filter(item => {
              return item.fullName.toLowerCase()
                .indexOf(query.toLowerCase()) > -1;
            });
          }, 200);
        } else {
          this.groupResults = [];
        }
      },
      defaultValue () {
        if (this.property.value && this.property.value.assignment) {
          this.assignment = {...this.property.value.assignment}
          if (typeof this.assignment.type === 'undefined') {
            this.assignment.type = 'static'
          }
        } else {
          this.assignment = { type: 'idm' }
        }

        let topType = this.assignment.type
        this.popup.assignmentObject.type = topType

        // 初始化 身份存储-分配类型
        if (this.assignment.idm && this.assignment.idm.type) {
          for (let i = 0; i < this.assignmentOptions.length; i++) {
            if (this.assignmentOptions[i].id == this.assignment.idm.type) {
              this.assignmentOption = this.assignmentOptions[i]
              break
            }
          }
        }
        // fill the IDM area
        if (!this.assignmentOption) {
          // Default, first time opening the popup
          this.assignmentOption = this.assignmentOptions[0]
        } else {
          // Values already filled
          if (this.assignment.idm) {
            // fill the IDM tab
            if (this.assignment.idm.assignee) {
              if (this.assignment.idm.assignee.id) {
                this.popup.assignmentObject.idm.assignee = this.assignment.idm.assignee
              } else {
                this.popup.assignmentObject.idm.assignee = { email: this.assignment.idm.assignee.email }
              }
            }

            if (this.assignment.idm.candidateUsers && this.assignment.idm.candidateUsers.length > 0) {
              for (let i = 0; i < this.assignment.idm.candidateUsers.length; i++) {
                this.popup.assignmentObject.idm.candidateUsers.push(this.assignment.idm.candidateUsers[i])
              }
            }

            if (this.assignment.idm.candidateGroups && this.assignment.idm.candidateGroups.length > 0) {
              for (let i = 0; i < this.assignment.idm.candidateGroups.length; i++) {
                this.popup.assignmentObject.idm.candidateGroups.push(this.assignment.idm.candidateGroups[i])
              }
            }
          }
        }

        // fill the static area
        if (topType === 'static') {
          if (this.assignment.assignee) {
            this.popup.assignmentObject.static.assignee = this.assignment.assignee
          }
          if (this.assignment.candidateUsers && this.assignment.candidateUsers.length > 0) {
            for (let i = 0; i < this.assignment.candidateUsers.length; i++) {
              this.popup.assignmentObject.static.candidateUsers.push(this.assignment.candidateUsers[i])
            }
          }

          if (this.assignment.candidateGroups && this.assignment.candidateGroups.length > 0) {
            for (let i = 0; i < this.assignment.candidateGroups.length; i++) {
              this.popup.assignmentObject.static.candidateGroups.push(this.assignment.candidateGroups[i])
            }
          }
        }

        this.initStaticContextForEditing()
      },
      // Click handler for + button after enum value
      addCandidateUserValue (index) {
        this.popup.assignmentObject.static.candidateUsers.splice(index + 1, 0, { value: '' })
      },
      // Click handler for - button after enum value
      removeCandidateUserValue (index) {
        this.popup.assignmentObject.static.candidateUsers.splice(index, 1)
      },
      // Click handler for + button after enum value
      addCandidateGroupValue (index) {
        this.popup.assignmentObject.static.candidateGroups.splice(index + 1, 0, { value: '' })
      },
      // Click handler for - button after enum value
      removeCandidateGroupValue (index) {
        this.popup.assignmentObject.static.candidateGroups.splice(index, 1)
      },
      initStaticContextForEditing ()  {
        if (!this.popup.assignmentObject.static.candidateUsers ||
          this.popup.assignmentObject.static.candidateUsers.length == 0) {
          this.popup.assignmentObject.static.candidateUsers = [{ value: '' }]
        }
        if (!this.popup.assignmentObject.static.candidateGroups ||
          this.popup.assignmentObject.static.candidateGroups.length == 0) {
          this.popup.assignmentObject.static.candidateGroups = [{ value: '' }]
        }
      },
      save () {
        handleAssignmentInput(this.popup.assignmentObject.static)
        this.assignment.type = this.popup.assignmentObject.type

        // IDM
        if ('idm' === this.popup.assignmentObject.type) {
          this.popup.assignmentObject.static = undefined
          // Construct an IDM object to be saved to the process model.
          var idm = { type: this.assignmentOption.id }
          if ('user' == idm.type) {
            if (this.popup.assignmentObject.idm.assignee) {
              idm.assignee = this.popup.assignmentObject.idm.assignee
            }
          } else if ('users' == idm.type) {
            if (this.popup.assignmentObject.idm.candidateUsers && this.popup.assignmentObject.idm.candidateUsers.length > 0) {
              idm.candidateUsers = this.popup.assignmentObject.idm.candidateUsers
            }
          } else if ('groups' == idm.type) {
            if (this.popup.assignmentObject.idm.candidateGroups && this.popup.assignmentObject.idm.candidateGroups.length > 0) {
              idm.candidateGroups = this.popup.assignmentObject.idm.candidateGroups
            }
          }
          this.assignment.idm = idm
          this.assignment.assignee = undefined
          this.assignment.candidateUsers = undefined
          this.assignment.candidateGroups = undefined
        }

        // static
        if ('static' === this.popup.assignmentObject.type) {
          this.popup.assignmentObject.idm = undefined
          this.assignment.idm = undefined
          this.assignment.assignee = this.popup.assignmentObject.static.assignee
          this.assignment.candidateUsers = this.popup.assignmentObject.static.candidateUsers
          this.assignment.candidateGroups = this.popup.assignmentObject.static.candidateGroups
        }

        this.property.value = {
          assignment: this.assignment
        }
        this.$emit('updateProperty', {property: this.property})
        this.close()
      },
      close () {
        this.property.mode = 'read'
      }
    }
  }
</script>

<style scoped>

</style>