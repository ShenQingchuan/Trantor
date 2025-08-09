declare module '@futu/ftoa' {
  export interface FtoaConfig {
    appKey: string
    appSecret: string
    region?: 'ML' | 'US' | 'SG' | 'AU' | 'JP' | 'CN_FINANCE' | 'MY' | 'CA'
    lang?: 0 | 1 | 2 // 0简体 1繁体 2英文
    isCmlb?: boolean
    network?: 'INSENS_OSS' | 'SENS_OSS'
    fns?: {
      callee?: string
      [key: string]: any
    }
  }

  export interface StaffInfo {
    id: number
    nick: string
    name: string
    email: string
    cellphone?: string
    feishuId?: string
    wxworkId?: string
    futuWorkDate?: string
    manageLevel?: string
    isLeave?: boolean
    [key: string]: any
  }

  interface DepartmentInfo {
    id: number
    name: string
    parentId?: number
    feishuId?: string
    [key: string]: any
  }

  interface PositionInfo {
    id: number
    name: string
    [key: string]: any
  }

  interface CompanyInfo {
    id: number
    name: string
    [key: string]: any
  }

  interface EventInfo {
    id: number
    type: string | number
    group: string
    time: string
    [key: string]: any
  }

  interface TagInfo {
    id: number
    type: string
    value: string
    name: string
    [key: string]: any
  }

  interface SignatureInfo {
    appKey: string
    timestamp: number
    nonce: number
    signature: string
    v: number
  }

  interface ReportRelation {
    staffId: number
    nick: string
    leaders: StaffInfo[]
    [key: string]: any
  }

  interface JobHistory {
    staffId: number
    [key: string]: any
  }

  interface TrialHistory {
    staffId: number
    [key: string]: any
  }

  interface ResignInfo {
    staffId: number
    resignTime: string
    [key: string]: any
  }

  class Ftoa {
    /**
     * Get Ftoa class instance
     * @param config Configuration object
     * @returns Ftoa instance
     */
    static Instance(config: FtoaConfig): Ftoa

    /**
     * Ftoa class constructor
     * @param config Configuration object
     */
    constructor(config: FtoaConfig)

    /**
     * Get signature for request parameters
     * @param queryString Query string parameters a=b&c=d
     * @param body POST body parameters
     * @param isJson Whether body is in JSON format
     * @param v Signature version number, enum 1,2,3
     * @returns Promise<SignatureInfo>
     */
    getSignature(queryString: string, body?: object, isJson?: boolean, v?: number): Promise<SignatureInfo>

    /**
     * Get new staff list
     * @param lastId Get staff info greater than lastId
     * @returns Promise of staff list
     */
    getNewStaffList(lastId?: string | number): Promise<StaffInfo[]>

    /**
     * Get all staff list (actually multiple paginated requests, recommend caching data)
     * @param includeLeave Whether to include resigned staff
     * @returns Promise of staff list
     */
    getAllStaffList(includeLeave?: boolean): Promise<StaffInfo[]>

    /**
     * Get staff info by staff ID
     * @param id Staff ID
     * @returns Promise of staff info
     */
    getStaffById(id: string | number): Promise<StaffInfo>

    /**
     * Get staff info by staff nick (English name)
     * @param nick Staff English name
     * @returns Promise of staff info
     */
    getStaffByNick(nick: string): Promise<StaffInfo>

    /**
     * Get staff info by Feishu ID
     * @param feishuId Staff Feishu ID
     * @returns Promise of staff info
     */
    getStaffByFeishuId(feishuId: string): Promise<StaffInfo>

    /**
     * Get staff info by WxWork ID
     * @param wxworkId Staff WxWork ID
     * @returns Promise of staff info
     */
    getStaffByWxworkId(wxworkId: string): Promise<StaffInfo>

    /**
     * Get staff list by ID array
     * @param idList Staff ID list
     * @returns Promise of staff list
     */
    getStaffListById(idList: (string | number)[]): Promise<StaffInfo[]>

    /**
     * Get staff list by nick array
     * @param nickList Staff nick list
     * @returns Promise of staff list
     */
    getStaffListByNick(nickList: string[]): Promise<StaffInfo[]>

    /**
     * Get staff list by Feishu ID array
     * @param feishuIdList Staff Feishu ID list
     * @returns Promise of staff list
     */
    getStaffListByFeishuId(feishuIdList: string[]): Promise<StaffInfo[]>

    /**
     * Get staff list by join date range
     * @param startDate Join date range start
     * @param endDate Join date range end
     * @returns Promise of staff list
     */
    getStaffListByFutuWorkDate(startDate: string, endDate?: string): Promise<StaffInfo[]>

    /**
     * Get staff list by cellphone
     * @param cellphone Cellphone number, at least 7 digits
     * @returns Promise of staff list
     */
    getStaffListByCellphone(cellphone: string): Promise<StaffInfo[]>

    /**
     * Get staff list by manage level
     * @param ManageLevelList Manage level list
     * @returns Promise of staff list
     */
    getStaffListByManageLevel(ManageLevelList: string[]): Promise<StaffInfo[]>

    /**
     * Get all staff department list
     * @param isPrimary Whether to get only primary position
     * @param includeLeave Whether to include resigned staff data
     * @returns Promise of staff list
     */
    getAllStaffDepartmentList(isPrimary?: boolean, includeLeave?: boolean): Promise<any[]>

    /**
     * Get staff department list by staff ID
     * @param id Staff ID
     * @param includeLeave Whether to include resigned staff data
     * @returns Promise of staff department list
     */
    getStaffDepartmentListById(id: string | number, includeLeave?: boolean): Promise<any[]>

    /**
     * Get staff department list by nick
     * @param nick Staff nick
     * @param includeLeave Whether to include resigned staff data
     * @returns Promise of staff department list
     */
    getStaffDepartmentListByNick(nick: string, includeLeave?: boolean): Promise<any[]>

    /**
     * Get all parent department IDs by department ID
     * @param id Department ID
     * @returns Promise of department list
     */
    getFullDepartmentList(id: string | number): Promise<DepartmentInfo[]>

    /**
     * Get department tree by department ID
     * @param id Department ID
     * @param feishuId Feishu ID
     * @returns Promise of department tree
     */
    getDepartmentTree(id?: string | number, feishuId?: string): Promise<any>

    /**
     * Get all position list (excluding job family and job class)
     * @returns Promise of position list
     */
    getAllPositionList(): Promise<PositionInfo[]>

    /**
     * Get position tree (including job family and job class)
     * @returns Promise of position tree
     */
    getPositionTree(): Promise<any[]>

    /**
     * Get company list
     * @returns Promise of company list
     */
    getAllCorpList(): Promise<CompanyInfo[]>

    /**
     * Get event list by groups
     * @param groups Event group list
     * @param lastId Get records greater than lastId
     * @param lastTime Get records later than lastTime
     * @returns Promise of event list
     */
    getEventListByGroups(groups: string[], lastId?: number, lastTime?: string): Promise<EventInfo[]>

    /**
     * Get event list by types
     * @param types Event type list
     * @param lastId Get records greater than lastId
     * @param lastTime Get records later than lastTime
     * @returns Promise of event list
     */
    getEventListByTypes(types: (string | number)[], lastId?: number, lastTime?: string): Promise<EventInfo[]>

    /**
     * Get event list
     * @param lastId Get records greater than lastId
     * @param lastTime Get records later than lastTime
     * @returns Promise of event list
     */
    getEventList(lastId?: number, lastTime?: string): Promise<EventInfo[]>

    /**
     * Get all staff NN uid list
     * @param includeLeave Whether to include resigned staff data
     * @returns Promise of all staff NN uid array
     */
    getAllNnUidList(includeLeave?: boolean): Promise<string[]>

    /**
     * Get mixed tree structure of departments and staff
     * @param isPrimary Whether to get only primary position data
     * @param lang Language option 0简体 1繁体 2英文
     * @returns Promise of department and staff tree data
     */
    getAllStaffWithDepartment(isPrimary?: boolean, lang?: number): Promise<any[]>

    /**
     * Get staff basic info by staff ID
     * @param id Staff ID
     * @returns Promise of staff info
     */
    getStaffMinById(id: string | number): Promise<StaffInfo>

    /**
     * Get staff basic info by Feishu ID
     * @param feishuId Feishu ID
     * @returns Promise of staff info
     */
    getStaffMinByFeishuId(feishuId: string | number): Promise<StaffInfo>

    /**
     * Get staff basic info by nick
     * @param nick Staff nick
     * @returns Promise of staff info
     */
    getStaffMinByNick(nick: string): Promise<StaffInfo>

    /**
     * Get staff basic info by WxWork ID
     * @param wxworkId Staff WxWork ID
     * @returns Promise of staff info
     */
    getStaffMinByWxworkId(wxworkId: string): Promise<StaffInfo>

    /**
     * Expand mail group
     * @param mailGroup Mail group to expand
     * @param nestStrategy Strategy for nested mail groups: asItIs|expand|remove
     * @param format Return format: raw|nick|email
     * @returns Promise of expanded results
     */
    expandMailGroup(mailGroup: string, nestStrategy?: 'asItIs' | 'expand' | 'remove', format?: 'raw' | 'nick' | 'email'): Promise<any[]>

    /**
     * Get tag list by category
     * @param type Tag category
     * @param idList Tag ID list
     * @returns Promise of tag list
     */
    getTagList(type?: string, idList?: number[]): Promise<TagInfo[]>

    /**
     * Get staff list by tag ID
     * @param tagId Tag ID
     * @param includeLeave Whether to include resigned staff data
     * @returns Promise of staff list
     */
    getStaffListByTagId(tagId: number, includeLeave?: boolean): Promise<StaffInfo[]>

    /**
     * Get staff list by tag value
     * @param value Tag value
     * @param includeLeave Whether to include resigned staff data
     * @returns Promise of staff list
     */
    getStaffListByTagValue(value: string, includeLeave?: boolean): Promise<StaffInfo[]>

    /**
     * Get staff tag by staff ID
     * @param staffId Staff ID
     * @param type Tag category
     * @returns Promise of tag
     */
    getStaffTagByStaffId(staffId: number, type: string): Promise<TagInfo>

    /**
     * Get staff tag by nick
     * @param nick Staff nick
     * @param type Tag category
     * @returns Promise of tag
     */
    getStaffTagByNick(nick: string, type: string): Promise<TagInfo>

    /**
     * Get staff tag by WxWork ID
     * @param wxworkId Staff WxWork ID
     * @param type Tag category
     * @returns Promise of tag
     */
    getStaffTagByWxworkId(wxworkId: string, type: string): Promise<TagInfo>

    /**
     * Get staff tag list by ID list
     * @param idList Staff ID list
     * @param type Tag category
     * @returns Promise of tag list
     */
    getStaffTagListById(idList: number[], type: string): Promise<TagInfo[]>

    /**
     * Get staff tag list by nick list
     * @param nickList Staff nick list
     * @param type Tag category
     * @returns Promise of tag list
     */
    getStaffTagListByNick(nickList: string[], type: string): Promise<TagInfo[]>

    /**
     * Get staff tag list by WxWork ID list
     * @param wxworkIdList Staff WxWork ID list
     * @param type Tag category
     * @returns Promise of tag list
     */
    getStaffTagListByWxworkId(wxworkIdList: string[], type: string): Promise<TagInfo[]>

    /**
     * Get staff language list by ID list
     * @param idList Staff ID list
     * @returns Promise of language tags
     */
    getStaffLangListById(idList: number[]): Promise<TagInfo[]>

    /**
     * Get staff language list by nick list
     * @param nickList Staff nick list
     * @returns Promise of language tags
     */
    getStaffLangListByNick(nickList: string[]): Promise<TagInfo[]>

    /**
     * Get staff language list by WxWork ID list
     * @param wxworkIdList Staff WxWork ID list
     * @returns Promise of language tags
     */
    getStaffLangListByWxworkId(wxworkIdList: string[]): Promise<TagInfo[]>

    /**
     * Get staff language by staff ID
     * @param staffId Staff ID
     * @returns Promise of staff language
     */
    getStaffLangByStaffId(staffId: number): Promise<TagInfo>

    /**
     * Get staff language by nick
     * @param nick Staff nick
     * @returns Promise of staff language
     */
    getStaffLangByNick(nick: string): Promise<TagInfo>

    /**
     * Get staff language by WxWork ID
     * @param wxworkId Staff WxWork ID
     * @returns Promise of staff language
     */
    getStaffLangByWxworkId(wxworkId: string): Promise<TagInfo>

    /**
     * Modify staff language by staff ID
     * @param staffId Staff ID
     * @param value Language tag value to modify to
     * @returns Promise<void>
     */
    modifyStaffLangByStaffId(staffId: number, value: string): Promise<void>

    /**
     * Modify staff language by nick
     * @param nick Staff nick
     * @param value Language tag value to modify to
     * @returns Promise<void>
     */
    modifyStaffLangByNick(nick: string, value: string): Promise<void>

    /**
     * Modify staff language by WxWork ID
     * @param wxworkId Staff WxWork ID
     * @param value Language tag value to modify to
     * @returns Promise<void>
     */
    modifyStaffLangByWxworkId(wxworkId: string, value: string): Promise<void>

    /**
     * Get staff timezone by nick
     * @param nick Staff nick
     * @returns Promise of staff timezone
     */
    getStaffTimeZoneByNick(nick: string): Promise<TagInfo>

    /**
     * Modify staff timezone by nick
     * @param nick Staff nick
     * @param value Timezone tag value to modify to
     * @returns Promise<void>
     */
    modifyStaffTimeZoneByNick(nick: string, value: string): Promise<void>

    /**
     * Get notice config by staff ID
     * @param id Staff ID
     * @param key Notice config key
     * @returns Promise of notice config value
     */
    getNoticeConfigById(id: string | number, key: string): Promise<number>

    /**
     * Get notice config by nick
     * @param nick Staff nick
     * @param key Notice config key
     * @returns Promise of notice config value
     */
    getNoticeConfigByNick(nick: string, key: string): Promise<number>

    /**
     * Get all notice configs by staff ID
     * @param id Staff ID
     * @returns Promise of all notice configs
     */
    getNoticeConfigListById(id: string | number): Promise<any[]>

    /**
     * Get all notice configs by nick
     * @param nick Staff nick
     * @returns Promise of all notice configs
     */
    getNoticeConfigListByNick(nick: string): Promise<any[]>

    /**
     * Filter notice config list by staff ID list
     * @param idList Staff ID list
     * @param key Notice config key
     * @returns Promise of all notice configs
     */
    filterKeyNoticeConfigListById(idList: (string | number)[], key: string): Promise<any[]>

    /**
     * Filter notice config list by nick list
     * @param nickList Staff nick list
     * @param key Notice config key
     * @returns Promise of all notice configs
     */
    filterKeyNoticeConfigListByNick(nickList: string[], key: string): Promise<any[]>

    /**
     * Set notice config by staff ID
     * @param id Staff ID
     * @param key Notice config key
     * @param value Notice config value
     * @returns Promise<void>
     */
    setNoticeConfigById(id: string | number, key: string, value: number): Promise<void>

    /**
     * Set notice config by nick
     * @param nick Staff nick
     * @param key Notice config key
     * @param value Notice config value
     * @returns Promise<void>
     */
    setNoticeConfigByNick(nick: string, key: string, value: number): Promise<void>

    /**
     * Batch set notice configs by staff ID
     * @param id Staff ID
     * @param data Notice config data (key-value object)
     * @returns Promise<void>
     */
    setNoticeConfigListById(id: string | number, data: Record<string, any>): Promise<void>

    /**
     * Batch set notice configs by nick
     * @param nick Staff nick
     * @param data Notice config data (key-value object)
     * @returns Promise<void>
     */
    setNoticeConfigListByNick(nick: string, data: Record<string, any>): Promise<void>

    /**
     * Get all leaders by staff ID
     * @param id Staff ID
     * @param tag Tag: marketGrowth-market growth, dottedLine-dotted line, default if not passed
     * @param departmentId Department ID, query primary position if not passed
     * @returns Promise of leader array, first item is current staff
     */
    getAllLeadersById(id: number, tag?: string, departmentId?: number): Promise<StaffInfo[]>

    /**
     * Get all leaders by nick
     * @param nick Staff nick
     * @param tag Tag: marketGrowth-market growth, dottedLine-dotted line, default if not passed
     * @param departmentId Department ID, query primary position if not passed
     * @returns Promise of leader array, first item is current staff
     */
    getAllLeadersByNick(nick: string, tag?: string, departmentId?: number): Promise<StaffInfo[]>

    /**
     * Get all leaders by WxWork ID
     * @param wxworkId Staff WxWork ID
     * @param tag Tag: marketGrowth-market growth, dottedLine-dotted line, default if not passed
     * @param departmentId Department ID, query primary position if not passed
     * @returns Promise of leader array, first item is current staff
     */
    getAllLeadersByWxworkId(wxworkId: string, tag?: string, departmentId?: number): Promise<StaffInfo[]>

    /**
     * Get all leaders by Feishu ID
     * @param feishuId Staff Feishu ID
     * @param tag Tag: marketGrowth-market growth, dottedLine-dotted line, default if not passed
     * @param departmentId Department ID, query primary position if not passed
     * @returns Promise of leader array, first item is current staff
     */
    getAllLeadersByFeishuId(feishuId: string, tag?: string, departmentId?: number): Promise<StaffInfo[]>

    /**
     * Get job history list by staff ID
     * @param staffId Staff ID array
     * @returns Promise of job history list
     */
    getJobHistoryListByStaffId(staffId: number[]): Promise<JobHistory[]>

    /**
     * Get trial history list by staff ID
     * @param staffId Staff ID array
     * @returns Promise of trial history list
     */
    getTrialHistoryListByStaffId(staffId: number[]): Promise<TrialHistory[]>

    /**
     * Get resign list by time period
     * @param startTime Start time
     * @param endTime End time
     * @returns Promise of resign list
     */
    getResignListByTime(startTime: string, endTime: string): Promise<ResignInfo[]>

    /**
     * Batch get resign user info
     * @param staffIdList Staff ID list
     * @param nickList Nick list
     * @returns Promise of resign user info
     */
    getResignInfo(staffIdList?: number[], nickList?: string[]): Promise<ResignInfo[]>

    /**
     * @deprecated Use getReportRelationsByStaffId instead
     * Batch get all leaders by staff ID
     * @param staffIdList Staff ID list
     * @returns Promise of staff leader list
     */
    batchGetAllLeadersByStaffId(staffIdList: number[]): Promise<any[]>

    /**
     * @deprecated Use getReportRelationsByNick instead
     * Batch get all leaders by nick
     * @param nickList Staff nick list
     * @returns Promise of staff leader list
     */
    batchGetAllLeadersByNick(nickList: string[]): Promise<any[]>

    /**
     * @deprecated
     * Batch get all leaders by WxWork ID
     * @param wxworkIdList Staff WxWork ID list
     * @returns Promise of staff leader list
     */
    batchGetAllLeadersByWxworkId(wxworkIdList: string[]): Promise<any[]>

    /**
     * @deprecated Use getReportRelationsByFeishuId instead
     * Batch get all leaders by Feishu ID
     * @param feishuIdList Staff Feishu ID list
     * @returns Promise of staff leader list
     */
    batchGetAllLeadersByFeishuId(feishuIdList: string[]): Promise<any[]>

    /**
     * Get all staff report relations
     * @param tag Tag: marketGrowth-market growth, dottedLine-dotted line, default if not passed
     * @param onlyPrimary Whether to query only primary position, 1-yes, 0-no, default 1
     * @returns Promise of report relation list
     */
    getAllReportRelations(tag?: string, onlyPrimary?: number): Promise<ReportRelation[]>

    /**
     * Get staff report relations by staff ID list
     * @param idList Staff ID list
     * @param tag Tag: marketGrowth-market growth, dottedLine-dotted line, default if not passed
     * @param onlyPrimary Whether to query only primary position, 1-yes, 0-no, default 1
     * @returns Promise of report relation list
     */
    getReportRelationsByStaffId(idList: number[], tag?: string, onlyPrimary?: number): Promise<ReportRelation[]>

    /**
     * Get staff report relations by nick list
     * @param nickList Staff nick list
     * @param tag Tag: marketGrowth-market growth, dottedLine-dotted line, default if not passed
     * @param onlyPrimary Whether to query only primary position, 1-yes, 0-no, default 1
     * @returns Promise of report relation list
     */
    getReportRelationsByNick(nickList: string[], tag?: string, onlyPrimary?: number): Promise<ReportRelation[]>

    /**
     * Get staff report relations by Feishu ID list
     * @param feishuIdList Staff Feishu ID list
     * @param tag Tag: marketGrowth-market growth, dottedLine-dotted line, default if not passed
     * @param onlyPrimary Whether to query only primary position, 1-yes, 0-no, default 1
     * @returns Promise of report relation list
     */
    getReportRelationsByFeishuId(feishuIdList: string[], tag?: string, onlyPrimary?: number): Promise<ReportRelation[]>
  }

  export default Ftoa
}
