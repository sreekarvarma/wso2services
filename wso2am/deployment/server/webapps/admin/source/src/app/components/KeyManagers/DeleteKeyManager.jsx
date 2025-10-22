/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import API from 'AppData/api';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import DialogContentText from '@mui/material/DialogContentText';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FormDialogBase from 'AppComponents/AdminPages/Addons/FormDialogBase';
import { useAppContext } from 'AppComponents/Shared/AppContext';

/**
 * Render delete dialog box.
 * @param {JSON} props component props.
 * @returns {JSX} Loading animation.
 */
function Delete({ updateList, dataRow, isDisabled }) {
    const { id, type, isGlobal } = dataRow;
    const { isSuperTenant, user: { _scopes } } = useAppContext();
    const isSuperAdmin = isSuperTenant && _scopes.includes('apim:admin_settings');
    const intl = useIntl();
    const formSaveCallback = () => {
        // todo: don't create a new promise
        const promiseAPICall = new Promise((resolve, reject) => {
            const restApi = new API();
            const api = isGlobal ? restApi.deleteGlobalKeyManager(id) : restApi.deleteKeyManager(id);
            api
                .then(() => {
                    resolve(
                        <FormattedMessage
                            id='AdminPages.KeyManagers.Delete.form.delete.successful'
                            defaultMessage='KeyManager deleted successfully'
                        />,
                    );
                })
                .catch((error) => {
                    reject(error.response.body.description);
                })
                .finally(() => {
                    updateList();
                });
        });
        return promiseAPICall;
    };

    return (
        <FormDialogBase
            title={intl.formatMessage({
                id: 'AdminPages.KeyManagers.Delete.form.delete.dialog.title',
                defaultMessage: 'Delete KeyManager ?',
            })}
            saveButtonText={intl.formatMessage({
                id: 'AdminPages.KeyManagers.Delete.form.delete.dialog.btn',
                defaultMessage: 'Delete',
            })}
            icon={<DeleteForeverIcon aria-label='key-manager-delete-icon' />}
            formSaveCallback={formSaveCallback}
            triggerIconProps={{
                color: 'primary',
                component: 'span',
                disabled: type === 'default' || (isGlobal && !isSuperAdmin) || isDisabled,
            }}
        >
            <DialogContentText>
                <FormattedMessage
                    id='AdminPages.KeyManager.Delete.form.delete.confirmation.message'
                    defaultMessage='Are you sure you want to delete this KeyManager ?'
                />
            </DialogContentText>
        </FormDialogBase>
    );
}
Delete.propTypes = {
    updateList: PropTypes.number.isRequired,
    dataRow: PropTypes.shape({
        id: PropTypes.number.isRequired,
    }).isRequired,
};
export default Delete;
