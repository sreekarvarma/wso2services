/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useEffect, useState } from 'react';
import { styled, Theme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Icon from '@mui/material/Icon';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import { Link, useHistory, useParams } from 'react-router-dom';
import CONSTS from 'AppData/Constants';
import API from 'AppData/api';
import { PolicySpec } from 'AppComponents/Apis/Details/Policies/Types';
import { Progress } from 'AppComponents/Shared';
import ResourceNotFoundError from 'AppComponents/Base/Errors/ResourceNotFoundError';
import PolicyViewForm from 'AppComponents/Apis/Details/Policies/PolicyForm/PolicyViewForm';

const PREFIX = 'ViewPolicy';

const classes = {
    titleWrapper: `${PREFIX}-titleWrapper`,
    titleLink: `${PREFIX}-titleLink`,
};

const StyledGrid = styled(Grid)(({ theme }:{ theme: Theme }) => ({
    [`& .${classes.titleWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing(3),
    },

    [`& .${classes.titleLink}`]: {
        color: theme.palette.primary.dark,
        marginRight: theme.spacing(1),
    },
}));

/**
 * Renders the view policy UI
 * @returns {TSX} Policy view UI.
 */
const ViewPolicy: React.FC = () => {

    const history = useHistory();
    const { policyId } = useParams<{ policyId?: string }>();
    const [policySpec, setPolicySpec] = useState<PolicySpec | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        if (policyId) {
            const promisedCommonPolicyGet =
                API.getCommonOperationPolicy(policyId);
            promisedCommonPolicyGet
                .then((response) => {
                    setPolicySpec(response.body);
                })
                .catch((error) => {
                    console.error(error);
                    const { status } = error;
                    if (status === 404) {
                        setNotFound(true);
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [policyId]);

    const redirectToPolicies = () => {
        history.push(CONSTS.PATH_TEMPLATES.COMMON_POLICIES);
    };

    const resourceNotFoundMessage = {
        title: 'Policy Not Found',
        body: 'The policy you are looking for is not available',
    };

    if (loading) {
        return <Progress per={90} message='Loading Policy ...' />;
    }

    if (notFound || !policySpec) {
        return <ResourceNotFoundError message={resourceNotFoundMessage} />;
    }

    return (
        <StyledGrid container>
            <Grid item sm={2} md={2} />
            <Grid item sm={12} md={8}>
                <Grid container sx={{ pt: 2 }}>
                    <Grid item md={12}>
                        <div className={classes.titleWrapper}>
                            <Link
                                to={CONSTS.PATH_TEMPLATES.COMMON_POLICIES}
                                className={classes.titleLink}
                            >
                                <Typography variant='h4' component='h2'>
                                    <FormattedMessage
                                        id='CommonPolicies.ViewPolicy.policies.title'
                                        defaultMessage='Policies'
                                    />
                                </Typography>
                            </Link>
                            <Icon>keyboard_arrow_right</Icon>
                            <Typography variant='h4' component='h3'>
                                {policySpec.displayName}
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item md={12}>
                        <Paper>
                            <PolicyViewForm
                                policySpec={policySpec}
                                onDone={redirectToPolicies}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
        </StyledGrid>
    );
};

export default ViewPolicy;
