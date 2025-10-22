/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { Component } from 'react';
import { styled } from '@mui/material/styles';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Select from '@mui/material/Select';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Alert from 'AppComponents/Shared/Alert';

import API from 'AppData/api';

const PREFIX = 'Policies';

const classes = {
    FormControl: `${PREFIX}-FormControl`
};


const Root = styled('div')(() => ({
    [`& .${classes.FormControl}`]: {
        padding: 0,
        width: '100%',
        marginTop: 0,
    }
}));

/**
 *
 *
 * @export
 * @class Policies
 * @extends {Component}
 */
class Policies extends Component {
    constructor() {
        super();
        this.state = {
            loading: false,
            selectedPolicies: [],
        };
        this.handleChange = this.handleChange.bind(this);
        this.changeTiers = this.changeTiers.bind(this);
        this.api = new API();
    }

    handleChange(e) {
        this.setState({
            selectedPolicies: e.target.value,
        });
        if (this.props.handlePolicies) {
            this.props.handlePolicies(e.target.value);
        }
    }

    changeTiers() {
        this.setState({
            loading: true,
        });
        const { api: { id: apiUUID } } = this.props;
        const promisedApi = this.api.get(apiUUID);
        promisedApi.then((response) => {
            const apiData = JSON.parse(response.data);
            apiData.policies = this.state.selectedPolicies;
            const promisedUpdate = this.api.update(apiData);
            promisedUpdate.then(() => {
                this.setState({
                    loading: false,
                });
                Alert.info(intl.formatMessage({
                    id: 'Apis.Details.LifeCycle.Policies.update.success',
                    defaultMessage: 'Lifecycle state updated successfully',
                }));
            });
        });
    }

    /**
     *
     *
     * @returns
     * @memberof Policies
     */
    render() {
        const {
            handleInputChange, api, policies, isAPIProduct, classes,
        } = this.props;
        const { loading } = this.state;
        if (loading) {
            return 'Loading . . .';
        }
        return (
            (<Root>
                <FormControl className={classes.FormControl}>
                    <InputLabel htmlFor='policy-selector'>
                        <FormattedMessage
                            id='Apis.Details.LifeCycle.Policies.business.plans'
                            defaultMessage='Business Plans'
                        />
                    </InputLabel>
                    <Select
                        error={api.policies && api.policies.length === 0}
                        fullWidth
                        margin='none'
                        multiple
                        name='policies'
                        value={api.policies || []}
                        onChange={handleInputChange}
                        input={<Input id='policy-selector' />}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    width: 200,
                                },
                            },
                        }}
                    >
                        {policies.map((policy) => (
                            <MenuItem
                                key={policy.name}
                                value={policy.name}
                                style={{
                                    fontWeight: policies.indexOf(policy.name) !== -1 ? '500' : '400',
                                }}
                            >
                                {policy.name}
                            </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>
                        {isAPIProduct
                            ? (
                                <FormattedMessage
                                    id='Apis.Details.LifeCycle.Policies.select.plan.api.product'
                                    defaultMessage='Select a plan for the API product.'
                                />
                            )
                            : (
                                <FormattedMessage
                                    id='Apis.Details.LifeCycle.Policies.select.plan.api'
                                    defaultMessage='Select a plan for the API and enable API level throttling.'
                                />
                            )}
                    </FormHelperText>
                </FormControl>
            </Root>)
        );
    }
}
Policies.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    api: PropTypes.shape({}).isRequired,
    handleInputChange: PropTypes.func.isRequired,
    policies: PropTypes.shape({}).isRequired,
};

export default injectIntl(Policies);
