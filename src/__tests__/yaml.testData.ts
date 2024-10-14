
export const sampleYAML = `
enums:
  UserRole:
    - ADMIN
    - GENERAL
    - OPERATOR
    - MANAGER
    - ACCOUNTING
  ServiceType:
    - LONG_TERM_CARE_HEALTH_FACILITY
    - SERVICE_APARTMENT_PAID_SENIOR_HOME
    - SERVICE_APARTMENT_WITH_CARE
    - HOUSING_TYPE_SERVICE_APARTMENT
    - ELDERLY_WELFARE_FACILITY
    - GROUP_HOME
    - HOUSING_TYPE_PAID_SENIOR_HOME
    - PAID_SENIOR_HOME_WITH_CARE
    - EMPTY
  PostStatus:
    - DRAFT
    - PUBLISHED
    - ARCHIVED

models:
  UserCollection:
    fields:
      - name: id
        type: String
        isRequired: true
        isUnique: true
        constraints:
          maxLength: 36
        isReadOnly: false
      - name: email
        type: String
        isRequired: true
        isUnique: true
        isList: false
        isRelation: false
        isReadOnly: false
      - name: name
        type: String
        isRequired: true
        constraints:
          maxLength: 100
        isUnique: false
        isList: false
        isRelation: false
        isReadOnly: false
      - name: role
        type: UserRole
        isRequired: true
        isUnique: false
        isList: false
        isRelation: false
        isReadOnly: false
      - name: posts
        type: Post
        isRequired: false
        isUnique: false
        isList: true
        isRelation: true
        relationModel: Post
        isReadOnly: false
      - name: phoneNumbers
        type: String
        isRequired: false
        isUnique: false
        isList: true
        isRelation: false
        isReadOnly: false
      - name: authSecondFactor
        type: String
        isRequired: false
        isUnique: false
        isList: true
        isRelation: false
        isReadOnly: false
      - name: secondFactorEmail
        type: String
        isRequired: false
        isUnique: false
        isList: false
        isRelation: false
        isReadOnly: false
      - name: createdAt
        type: DateTime
        isRequired: false
        isUnique: false
        isList: false
        isRelation: false
        isReadOnly: true
      - name: updatedAt
        type: DateTime
        isRequired: false
        isUnique: false
        isList: false
        isRelation: false
        isReadOnly: false
  PostCollection:
    fields:
      - name: id
        type: String
        isRequired: true
        isUnique: true
        constraints:
          maxLength: 36
        isReadOnly: false
      - name: title
        type: String
        isRequired: true
        constraints:
          maxLength: 200
        isUnique: false
        isList: false
        isRelation: false
        isReadOnly: false
      - name: content
        type: String
        isRequired: true
        isUnique: false
        isList: false
        isRelation: false
        isReadOnly: false
      - name: status
        type: PostStatus
        isRequired: true
        isUnique: false
        isList: false
        isRelation: false
        isReadOnly: false
      - name: authorId
        type: String
        isRequired: true
        isUnique: false
        isList: false
        isRelation: false
        isReadOnly: false
      - name: author
        type: User
        isRequired: false
        isUnique: false
        isList: false
        isRelation: true
        relationModel: User
        isReadOnly: false
      - name: createdAt
        type: DateTime
        isRequired: false
        isUnique: false
        isList: false
        isRelation: false
        isReadOnly: true
      - name: updatedAt
        type: DateTime
        isRequired: false
        isUnique: false
        isList: false
        isRelation: false
        isReadOnly: false
`;