/**
 * Copyright (c) 2020, WSO2 Inc. (http://wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable */
import Utils from './Utils';
import Resource from './Resource';
import cloneDeep from 'lodash.clonedeep';
import APIClientFactory from 'AppData/APIClientFactory';
import Configurations from 'Config';

/**
 * An abstract representation of an API
 */
class API extends Resource {
    constructor(name, version, context, kwargs) {
        super();
        let properties = kwargs;
        if (name instanceof Object) {
            properties = name;
            Utils.deepFreeze(properties);
        } else {
            this.name = name;
            this.version = version;
            this.context = context;
            this.isDefaultVersion = false;
            this.gatewayEnvironments = ['Default']; //todo: load the environments from settings API
            this.transport = ['http', 'https'];
            this.visibility = 'PUBLIC';
            this.endpointConfig = {
                endpoint_type: 'http',
                sandbox_endpoints: {
                    url: '',
                },
                production_endpoints: {
                    url: '',
                },
            };
        }
        this.apiType = API.CONSTS.API;
        this._data = properties;
        for (const key in properties) {
            if (Object.prototype.hasOwnProperty.call(properties, key)) {
                this[key] = properties[key];
            }
        }
    }

    /**
     *
     * @param data
     * @returns {object} Metadata for API request
     * @private
     */
    _requestMetaData() {
        Resource._requestMetaData();
    }

    /**
     *
     * Instance method of the API class to provide raw JSON object
     * which is API body friendly to use with REST api requests
     * Use this method instead of accessing the private _data object for
     * converting to a JSON representation of an API object.
     * Note: This is deep coping, Use sparingly, Else will have a bad impact on performance
     * Basically this is the revers operation in constructor.
     * This method simply iterate through all the object properties (excluding the properties in `excludes` list)
     * and copy their values to new object.
     * So use this method with care!!
     * @memberof API
     * @param {Array} [userExcludes=[]] List of properties that are need to be excluded from the generated JSON object
     * @returns {JSON} JSON representation of the API
     */
    toJSON(userExcludes = []) {
        var copy = {},
            excludes = ['_data', 'client', 'apiType', ...userExcludes];
        for (var prop in this) {
            if (!excludes.includes(prop)) {
                copy[prop] = cloneDeep(this[prop]);
            }
        }
        return copy;
    }

    /**
     * Importing a WSDL and creating an API by a .wsdl file or a WSDL archive zip file
     *
     * @static
     * @param {*} url WSDL url
     * @param {*} additionalProperties additional properties of the API eg: name, version, context
     * @param {*} implementationType SOAPTOREST or SOAP
     * @returns {API} API object which was created
     * @memberof Wsdl
     */
    static importByUrl(url, additionalProperties, implementationType = 'SOAP') {
        const apiClient = new APIClientFactory().getAPIClient(
            Utils.getCurrentEnvironment(),
        ).client;
        return apiClient.then((client) => {
            client.apis.APIs;
            const promisedResponse = client.apis.APIs.importWSDLDefinition({
                url,
                additionalProperties: JSON.stringify(additionalProperties),
                implementationType,
            });

            return promisedResponse.then((response) => new API(response.body));
        });
    }

    /**
     * Get settings of an API
     */
    getSettings() {
        const promisedSettings = this.client.then(client => {
            return client.apis['Settings'].get_settings();
        });
        return promisedSettings.then(response => response.body);
    }

    /**
     * Retrieve scopes for a particular user
     */
    getUserScope(username, scope) {
        return this.client.then((client) => {
            const data = {
                username: username,
                scopeName: btoa(scope),
            };
            return client.apis['System Scopes'].systemScopesScopeNameGet(
                data,
                this._requestMetaData(),
            );
        });
    }

    /**
     * Validate a given role
     */
    validateSystemRole(role) {
        const promise = this.client.then(client => {
            return client.apis.Roles.validateSystemRole({ roleId: role });
        });
        return promise;
    }

    /**
     * Get list of advanced throttling policies
     */
    getThrottlingPoliciesAdvanced() {
        return this.client.then((client) => {
            return client.apis['Advanced Policy (Collection)'].get_throttling_policies_advanced(
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get list of api categories
     */
    getThrottlingPoliciesAdvancedPolicyId(policyId) {
        return this.client.then((client) => {
            return client.apis['Advanced Policy (Individual)'].get_throttling_policies_advanced__policyId_(
                {policyId: policyId},
                this._requestMetaData(),
            );
        });
    }

    /**
     * Update an advanced throttling policy
     */
    putThrottlingPoliciesAdvanced(policyId, policy) {
        return this.client.then((client) => {
            return client.apis['Advanced Policy (Individual)'].put_throttling_policies_advanced__policyId_(
                {
                    policyId: policyId,
                    'Content-Type': 'application/json',
                },
                { requestBody: policy },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Add new advanced throttling policy
     */
    postThrottlingPoliciesAdvanced(policy) {
        return this.client.then((client) => {
            return client.apis['Advanced Policy (Collection)'].post_throttling_policies_advanced(
                { 'Content-Type': 'application/json' },
                { requestBody: policy },
                this._requestMetaData(),
            );
        });
    }
    /**
     * delete policy
     */
    deleteThrottlingPoliciesAdvanced(policyId) {
        return this.client.then((client) => {
            return client.apis['Advanced Policy (Individual)'].delete_throttling_policies_advanced__policyId_(
                {policyId: policyId},
                this._requestMetaData(),
            );
        });
    }


    /**
     * Get list of api categories
     */
    apiCategoriesListGet() {
        return this.client.then((client) => {
            return client.apis['API Category (Collection)'].get_api_categories(
                this._requestMetaData(),
            );
        });
    }

    /**
     * Update an API category
     */
    updateAPICategory(id, name, description) {
        return this.client.then((client) => {
            const data = {
                name: name,
                description: description,
            };
            return client.apis[
                'API Category (Individual)'
            ].put_api_categories__apiCategoryId_(
                { apiCategoryId: id },
                { requestBody: data },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Delete an API Category
     */
    deleteAPICategory(id) {
        return this.client.then((client) => {
            return client.apis[
                'API Category (Individual)'
            ].delete_api_categories__apiCategoryId_(
                { apiCategoryId: id },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Add an API Category
     */
    createAPICategory(name, description) {
        return this.client.then((client) => {
            const data = {
                name: name,
                description: description,
            };
            const payload = {
                'Content-Type': 'application/json',
            };
            return client.apis['API Category (Individual)'].post_api_categories(
                payload,
                { requestBody: data },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get list of labels
     */
       labelsListGet() {
        return this.client.then((client) => {
            return client.apis['Labels (Collection)'].getAllLabels(
                this._requestMetaData(),
            );
        });
    }

    /**
     * Update an Labels
     */
    updateLabel(id, name, description) {
        return this.client.then((client) => {
            const data = {
                name: name,
                description: description,
            };
            return client.apis[
                'Label (Individual)'
            ].updateLabel(
                { labelId: id },
                { requestBody: data },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Delete an Labels
     */
    deleteLabel(id) {
        return this.client.then((client) => {
            return client.apis[
                'Label (Individual)'
            ].deleteLabel(
                { labelId: id },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Add an Labels
     */
    createLabel(name, description) {
        return this.client.then((client) => {
            const data = {
                name: name,
                description: description,
            };
            const payload = {
                'Content-Type': 'application/json',
            };
            return client.apis['Label (Individual)'].createLabel(
                payload,
                { requestBody: data },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get Label api usages
     */
    getLabelApiUsages(labelId) {
        return this.client.then((client) => {
            return client.apis['Label (Individual)'].getLabelUsage(
                { labelId: labelId },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get Application Throttling Policies
     */
    applicationThrottlingPoliciesGet() {
        return this.client.then((client) => {
            return client.apis['Application Policy (Collection)'].get_throttling_policies_application(
                this._requestMetaData(),
            );
        });
    }

    /**
     * Delete an Application Throttling Policy
     */
    deleteApplicationThrottlingPolicy(policyId) {
        return this.client.then((client) => {
            return client.apis['Application Policy (Individual)'].delete_throttling_policies_application__policyId_(
                { policyId: policyId },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Add a Subscription Throttling Policy
     */
    addSubscriptionThrottlingPolicy(body) {
        return this.client.then((client) => {
            const payload = {
                'Content-Type': 'application/json',
            };
            return client.apis['Subscription Policy (Collection)'].post_throttling_policies_subscription(
                payload,
                { requestBody: body },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Delete a Subscription Throttling Policy
     */
    deleteSubscriptionPolicy(policyId) {
        return this.client.then((client) => {
            return client.apis['Subscription Policy (Individual)'].delete_throttling_policies_subscription__policyId_(
                { policyId: policyId },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Update a Subscription Throttling Policy
     */
    updateSubscriptionThrottlingPolicy(policyId, body) {
        return this.client.then((client) => {
            const payload = {
                policyId: policyId,
                'Content-Type': 'application/json',
            };
            return client.apis['Subscription Policy (Individual)'].put_throttling_policies_subscription__policyId_(
                payload,
                { requestBody: body },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get details of a Subscription Throttling Policy
     */
    subscriptionThrottlingPolicyGet(policyId) {
        return this.client.then((client) => {
            return client.apis['Subscription Policy (Individual)'].get_throttling_policies_subscription__policyId_(
                { policyId: policyId },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Add an Application Throttling Policy
     */
    addApplicationThrottlingPolicy(body) {
        return this.client.then((client) => {
            const payload = {
                'Content-Type': 'application/json',
            };
            return client.apis['Application Policy (Collection)'].post_throttling_policies_application(
                payload,
                { requestBody: body },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get details of an Application Throttling Policy
     */
    applicationThrottlingPolicyGet(policyId) {
        return this.client.then((client) => {
            return client.apis['Application Policy (Individual)'].get_throttling_policies_application__policyId_(
                { policyId: policyId },
                this._requestMetaData(),
            );
        });
    }

     /**
     * Update an Application Throttling Policy
     */
    updateApplicationThrottlingPolicy(policyId, body) {
        return this.client.then((client) => {
            const payload = {
                policyId: policyId,
                'Content-Type': 'application/json',
            };
            return client.apis['Application Policy (Individual)'].put_throttling_policies_application__policyId_(
                payload,
                { requestBody: body },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get a list of applications from all users
     */
    getApplicationList(params) {
        return this.client.then((client) => {
            return client.apis['Application (Collection)'].get_applications(
                params, this._requestMetaData(),
            );
        });
    }

    /**
     * Get a list of apis from all users
     */
    getApiList(params) {
        return this.client.then((client) => {
            return client.apis['APIs'].getAllAPIs(
                params, this._requestMetaData(),
            );
        });
    }

    /**
     * Get Subscription Throttling Policies
     */
    getSubscritionPolicyList() {
        return this.client.then((client) => {
            return client.apis['Subscription Policy (Collection)'].get_throttling_policies_subscription(
                this._requestMetaData(),
            );
        });
    }

     /**
     * Update an application's owner
     */
    updateApplicationOwner(id, owner) {
        return this.client.then((client) => {
            return client.apis[
                'Application'
            ].post_applications__applicationId__change_owner(
                { owner: owner, applicationId: id },
                this._requestMetaData(),
            );
        });
    }

     /**
     * Update an api's owner
     */
     updateApiProvider(apiId, provider) {
        return this.client.then((client) => {
            return client.apis['Api Provider Change'].providerNamePost(
                { provider: provider, apiId: apiId },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get a list of available Gateway Environments
     */
    getGatewayEnvironmentList() {
        return this.client.then((client) => {
            return client.apis['Environments'].get_environments(
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get a Gateway Environment
     */
    getGatewayEnvironment(id) {
        return this.client.then((client) => {
            return client.apis['Environments'].get_environments__environmentId_(
                { environmentId: id },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Delete a Gateway Environment
     */
    deleteGatewayEnvironment(id) {
        return this.client.then((client) => {
            return client.apis['Environments'].delete_environments__environmentId_(
                { environmentId: id },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Add a Gateway Environment
     */
    addGatewayEnvironment(name, displayName, type, description, gatewayType, vhosts, permissions, additionalProperties, provider="wso2",  callback = null) {
        return this.client.then((client) => {
            const data = { name, displayName, type, description, gatewayType, vhosts, permissions, additionalProperties, provider };
            const payload = {
                'Content-Type': 'application/json',
            };
            return client.apis['Environments'].post_environments(
                payload,
                { requestBody: data },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Update a Gateway Environment
     */
    updateGatewayEnvironment(id, name, displayName, type, description, gatewayType, vhosts, permissions, additionalProperties, provider="wso2", callback = null) {
        return this.client.then((client) => {
            const data = { name, displayName, type, description, gatewayType, vhosts, permissions, additionalProperties, provider };
            return client.apis['Environments'].put_environments__environmentId_(
                { environmentId: id },
                { requestBody: data },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get Blacklist Policies
     */
    blacklistPoliciesGet() {
        return this.client.then((client) => {
            return client.apis['Deny Policies (Collection)'].get_throttling_deny_policies(
                this._requestMetaData(),
            );
        });
    }

    /**
     * Delete an Deny Policy
     */
    deleteBlacklistPolicy(policyId) {
        return this.client.then((client) => {
            return client.apis['Deny Policy (Individual)'].delete_throttling_deny_policy__conditionId_(
                { conditionId: policyId },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Add a Deny Policy
     */
    addBlacklistPolicy(body) {
        return this.client.then((client) => {
            const payload = {
                'Content-Type': 'application/json',
            };
            return client.apis['Deny Policies (Collection)'].post_throttling_deny_policies(
                payload,
                { requestBody: body },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get details of a Deny Policy
     */
    blacklistPolicyGet(policyId) {
        return this.client.then((client) => {
            return client.apis['Deny Policy (Individual)'].get_throttling_deny_policy__conditionId_(
                { conditionId: policyId },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Update the Condition Status of a Deny Policy
     */
    updateBlacklistPolicy(policyId, conditionStatus) {
        return this.client.then((client) => {
            const payload = {
                conditionStatus: conditionStatus,
            };
            return client.apis['Deny Policy (Individual)'].patch_throttling_deny_policy__conditionId_(
                { conditionId: policyId, 'Content-Type': 'application/json', },
                { requestBody: payload },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get Custom Policies
     */
    customPoliciesGet() {
        return this.client.then((client) => {
            return client.apis['Custom Rules (Collection)'].get_throttling_policies_custom(
                this._requestMetaData(),
            );
        });
    }

    /**
     * Add a Custom Policy
     */
    addCustomPolicy(body) {
        return this.client.then((client) => {
            const payload = {
                'Content-Type': 'application/json',
            };
            return client.apis['Custom Rules (Collection)'].post_throttling_policies_custom(
                payload,
                { requestBody: body },
                this._requestMetaData(),
            );
        });
    }

     /**
     * Delete a Custom Policy
     */
    deleteCustomPolicy(policyId) {
        return this.client.then((client) => {
            return client.apis['Custom Rules (Individual)'].delete_throttling_policies_custom__ruleId_(
                { ruleId: policyId },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get details of a Custom Policy
     */
    customPolicyGet(policyId) {
        return this.client.then((client) => {
            return client.apis['Custom Rules (Individual)'].get_throttling_policies_custom__ruleId_(
                { ruleId: policyId },
                this._requestMetaData(),
            );
        });
    }

     /**
     * Update a Custom Policy
     */
    updateCustomPolicy(policyId, body) {
        return this.client.then((client) => {
            const payload = {
                ruleId: policyId,
                'Content-Type': 'application/json',
            };
            return client.apis['Custom Rules (Individual)'].put_throttling_policies_custom__ruleId_(
                payload,
                { requestBody: body},
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get Detected bot data
     */
    getDetectedBotData() {
        return this.client.then((client) => {
            return client.apis['default'].getBotDetectionData(
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get list of emails configured at Bot Detection --> Configure Emails
     */
    botDetectionNotifyingEmailsGet() {
        return this.client.then((client) => {
            return client.apis['Bot Detection Alert Subscriptions'].getBotDetectionAlertSubscriptions(
                this._requestMetaData(),
            );
        });
    }

    /**
     * Add an email for Bot Detection notifications
     */
    addBotDetectionNotifyingEmail(email) {
        return this.client.then((client) => {
            const data = {
                email: email,
            };
            const payload = {
                'Content-Type': 'application/json',
            };
            return client.apis['Bot Detection Alert Subscriptions'].subscribeForBotDetectionAlerts(
                payload,
                { requestBody: data },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Delete an email from Bot Detection notification configuration
     */
    deleteBotDetectionNotifyingEmail(id) {
        return this.client.then((client) => {
            return client.apis['Bot Detection Alert Subscriptions'].unsubscribeFromBotDetectionAlerts(
                { uuid: id },
                this._requestMetaData(),
            );
        });
    }

     /**
     * Retrieve tenant information of the given username
     */
    getTenantInformation(username) {
        return this.client.then((client) => {
            return client.apis['Tenants'].getTenantInfoByUsername(
                { username: username },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Upload a Tenant Theme
     */
    uploadTenantTheme(file) {
        return this.client.then(
            client => {
                return client.apis['Tenant Theme'].importTenantTheme(
                    {},
                    {
                        requestBody: {
                            file: file,
                        }
                    }
                );
            },
            this._requestMetaData({
                'Content-Type': 'multipart/form-data',
            }),
        );
    }

    /**
     * Export a Tenant Theme
     */
    exportTenantTheme() {
        return this.client.then(
            client => {
                return client.apis['Tenant Theme'].exportTenantTheme();
            },
            this._requestMetaData(),
        );
    }

    /**
     * @static
     * Get the supported alert types for admin
     * @return {Promise}
     * */
    getSupportedAlertTypes() {
        return this.client.then((client) => {
            return client.apis.Alerts.getAdminAlertTypes(this._requestMetaData());
        });
    }

    /**
     * @static
     * Get the subscribed alert types by the current user.
     * @returns {Promise}
     * */
    getSubscribedAlertTypesByUser() {
        return this.client.then((client) => {
            return client.apis['Alert Subscriptions']
            .getSubscribedAlertTypes(this._requestMetaData());
        });
    }

    /**
     * @static
     * Subscribe to the provided set of alerts.
     * @return {Promise}
     * */
    subscribeAlerts(alerts) {
        return this.client.then((client) => {
            return client.apis['Alert Subscriptions']
            .subscribeToAlerts({}, { requestBody: alerts }, this._requestMetaData());
        });
    }

    /**
     * @static
     * Unsubscribe from all the alerts.
     * @return {Promise}
     * */
    unsubscribeAlerts() {
        return this.client.then((client) => {
            return client.apis['Alert Subscriptions']
            .unsubscribeAllAlerts(this._requestMetaData());
        });
    }

    /**
     * Get lis of keymanagers Registrered
     */
    getKeyManagersList() {
        return this.client.then((client) => {
            return client.apis['Key Manager (Collection)'].get_key_managers(
                this._requestMetaData(),
            );
        });
    }

    getGlobalKeyManagersList() {
        return this.client.then((client) => {
            return client.apis['Global Key Manager (Collection)'].get_global_key_managers(
                this._requestMetaData(),
            );
        });
    }

    /**
     * Discover keymanager from well known url
     */
    keyManagersDiscover(url) {
        return this.client.then((client) => {
            return client.apis['Key Manager (Collection)'].post_key_managers_discover(
                this._requestMetaData(),
            );
        });
    }

    keyManagersDiscover(requestData) {
        return this.client.then((client) => {
            const payload = {
                'Content-Type': 'application/json',
            };
            return client.apis['Key Manager (Collection)'].post_key_managers_discover(
                payload,
                { requestBody: requestData },
                this._requestMetaData(),
            );
        });
    }

    keyManagerGet(keyManagerId) {
        return this.client.then((client) => {
            return client.apis['Key Manager (Individual)'].get_key_managers__keyManagerId_(
                { keyManagerId: keyManagerId },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get global keymanager
     * @param keyManagerId keymanager id
     * @returns {*}
     */
        globalKeyManagerGet(keyManagerId) {
            return this.client.then((client) => {
                return client.apis['Global Key Manager (Individual)'].get_global_key_managers__keyManagerId_(
                    { keyManagerId: keyManagerId },
                    this._requestMetaData(),
                );
            });
        }

     /**
     * Get key manager usages
     */
    getKeyManagerUsages(keyManagerId) {
        return this.client.then((client) => {
            return client.apis['Key Manager (Individual)'].get_key_managers__keyManagerId__usages(
                { keyManagerId: keyManagerId },
                this._requestMetaData(),
            );
        });
    }
    
     /**
     * Get key manager application usages
     */
     getKeyManagerApplicationUsages(keyManagerId) {
        return this.client.then((client) => {
            return client.apis['Key Manager (Individual)'].get_key_managers__keyManagerId__app_usages(
                { keyManagerId: keyManagerId },
                this._requestMetaData(),
            );
        });
    }

     /**
     * Get key manager api usages
     */
     getKeyManagerApiUsages(keyManagerId) {
        return this.client.then((client) => {
            return client.apis['Key Manager (Individual)'].get_key_managers__keyManagerId__api_usages(
                { keyManagerId: keyManagerId },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Add an Key Manager
     */
    addKeyManager(body) {
        return this.client.then((client) => {
            const payload = {
                'Content-Type': 'application/json',
            };
            return client.apis['Key Manager (Collection)'].post_key_managers(
                payload,
                { requestBody: body },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Add a Global Key Manager
     * @param body
     * @returns {*}
     */
       addGlobalKeyManager(body) {
        return this.client.then((client) => {
            const payload = {
                'Content-Type': 'application/json',
            };
            return client.apis['Global Key Manager (Collection)'].post_global_key_managers(
                payload,
                { requestBody: body },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Update an Key Manager
     */
    updateKeyManager(keyManagerId, body) {
        return this.client.then((client) => {
            const payload = {
                keyManagerId: keyManagerId,
                'Content-Type': 'application/json',
            };
            return client.apis['Key Manager (Individual)'].put_key_managers__keyManagerId_(
                payload,
                { requestBody: body },
                this._requestMetaData(),
            );
        });
    }

    /**
         * Update a Global Key Manager
         * @param keyManagerId
         * @param body
         * @returns {*}
         */
    updateGlobalKeyManager(keyManagerId, body) {
        return this.client.then((client) => {
            const payload = {
                keyManagerId: keyManagerId,
                'Content-Type': 'application/json',
            };
            return client.apis['Global Key Manager (Individual)'].put_global_key_managers__keyManagerId_(
                payload,
                { requestBody: body },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Delete an Key Manager
     */
    deleteKeyManager(keyManagerId) {
        return this.client.then((client) => {
            return client.apis['Key Manager (Individual)'].delete_key_managers__keyManagerId_(
                {keyManagerId:keyManagerId},
                this._requestMetaData(),
            );
        });
    }

    /**
     * Delete a Global Key Manager
     * @param keyManagerId
     * @returns {*}
     */
        deleteGlobalKeyManager(keyManagerId) {
            return this.client.then((client) => {
                return client.apis['Global Key Manager (Individual)'].delete_global_key_managers__keyManagerId_(
                    {keyManagerId:keyManagerId},
                    this._requestMetaData(),
                );
            });
        }
    

    /**
     * Get list of workflow pending requests
     */
    workflowsGet(workflowType) {
        var limit = Configurations.app.workflows.limit;
        return this.client.then((client) => {
            return client.apis['Workflow (Collection)'].get_workflows(
                { workflowType: workflowType, limit: limit },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get workflow pending request according to external workflow reference
     */
    workflowGet(externalWorkflowReference) {
        return this.client.then((client) => {
            return client.apis['Workflows (Individual)'].get_workflows__externalWorkflowRef_(
                { externalWorkflowReference: externalWorkflowReference },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Update workflow request according to external workflow reference
     */
    updateWorkflow(workflowReferenceId,body) {
        return this.client.then((client) => {
            const payload = {
                workflowReferenceId: workflowReferenceId,
                'Content-Type': 'application/json',
            };
            return client.apis['Workflows (Individual)'].post_workflows_update_workflow_status(
                payload,
                { requestBody: body },
                this._requestMetaData(),
            );
        });
    }


    /**
     * Retrieve tenant conf
     */
    tenantConfGet() {
        return this.client.then((client) => {
            return client.apis['Tenant Config'].exportTenantConfig();
        });
    }

     /**
     * Update tenant conf
     */
    updateTenantConf(body) {
        return this.client.then((client) => {
            const payload = {
                'Content-Type': 'application/json',
            };
            return client.apis['Tenant Config'].updateTenantConfig(
                payload,
                { requestBody: body},
                this._requestMetaData(),
            );
        });
    }

    /**
     * Retrieve tenant conf
     */
    tenantConfSchemaGet() {
        return this.client.then((client) => {
            return client.apis['Tenant Config Schema'].exportTenantConfigSchema();
        });
    }

    /**
     * Get list of AI Vendors Configured
     */
    getAiVendorsList() {
        return this.client.then((client) => {
            return client.apis['LLMProviders'].getLLMProviders(
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get AI Vendor Configuration by id
     * @param aiVendorId AI Vendor configuration id
     * @returns {*}
     */
   aiVendorGet(aiVendorId) {
        return this.client.then((client) => {
            return client.apis['LLMProvider'].getLLMProvider(
                { llmProviderId: aiVendorId },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Delete an AI Vendor
     * @param aiVendorId AI Vendor configuration id
     * @returns {*}
     */
    deleteAiVendor(aiVendorId) {
        return this.client.then((client) => {
            return client.apis['LLMProvider'].deleteLLMProvider(
                { llmProviderId: aiVendorId },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Add an AI Vendor
     */
    addAiVendor(aiVendorBody) {
        return this.client.then((client) => {
            const payload = {
                'Content-Type': 'multipart/form-data',
            };
            return client.apis['LLMProviders'].addLLMProvider(
                payload,
                { requestBody: {
                    ...aiVendorBody,
                    modelList: JSON.stringify(aiVendorBody.modelList)
                }},
                this._requestMetaData(),
            );
        });
    }

    /**
     * Update an AI Vendor
     */
    updateAiVendor(aiVendorId, aiVendorBody) {
        return this.client.then((client) => {
            const payload = {
                llmProviderId: aiVendorId,
                'Content-Type': 'multipart/form-data',
            };
            return client.apis['LLMProvider'].updateLLMProvider(
                payload,
                { requestBody: {
                    ...aiVendorBody,
                    llmProviderId: aiVendorId,
                    modelList: JSON.stringify(aiVendorBody.modelList)
                }},
                this._requestMetaData(),
            );
        });
    }

    /**
     * Retrieve transaction count
     */
    getTransactionCount(params) {
        return this.client.then((client) => {
            return client.apis['Transaction Records'].get_transaction_count(
                params, this._requestMetaData(),
            );
        });
    }

    /**
     * Get list of organizations
     */
    organizationsListGet() {
        return this.client.then((client) => {
            return client.apis['Organizations'].get_organizations(
                this._requestMetaData(),
            );
        });
    }

    /**
     * Add an organization
     */
    createOrganization(referenceId, name, description) {
        return this.client.then((client) => {
            const data = {
                externalOrganizationId: referenceId,
                displayName: name,
                description: description,
            };
            const payload = {
                'Content-Type': 'application/json',
            };
            return client.apis['Organizations'].post_organizations(
                payload,
                { requestBody: data },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Update an organization
     */
    updateOrganization(referenceId, orgId, name, description) {
        return this.client.then((client) => {
            const data = {
                externalOrganizationId: referenceId,
                displayName: name,
                description: description,
            };
            return client.apis[
                'Organizations'
            ].put_organizations__organizationId_(
                { organizationId: orgId },
                { requestBody: data },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Delete an organization
     */
    deleteOrganization(orgId, referenceId) {
        return this.client.then((client) => {
            return client.apis[
                'Organizations'
            ].delete_organizations__organizationId_(
                { externalOrganizationId: referenceId, organizationId: orgId },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Get user organization information
     */
    getUserOrganizationInfo() {
        return this.client.then((client) => {
            return client.apis['Users'].organizationInformation(this._requestMetaData());
        });
    }
}

API.CONSTS = {
    API: 'API',
    APIProduct: 'APIProduct',
};

Object.freeze(API.CONSTS);

export default API;
