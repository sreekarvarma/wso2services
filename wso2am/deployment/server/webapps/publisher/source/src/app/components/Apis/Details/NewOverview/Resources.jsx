/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import { styled, useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Chip from '@mui/material/Chip';
import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import LaunchIcon from '@mui/icons-material/Launch';

import Typography from '@mui/material/Typography';
import Api from 'AppData/api';
import CONSTS from 'AppData/Constants';
import { doRedirectToLogin } from 'AppComponents/Shared/RedirectToLogin';

const PREFIX = 'Resources';

const classes = {
    root: `${PREFIX}-root`,
    heading: `${PREFIX}-heading`,
    contentWrapper: `${PREFIX}-contentWrapper`,
    subHeading: `${PREFIX}-subHeading`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },

    [`& .${classes.heading}`]: {
        marginRight: 20,
    },

    [`& .${classes.contentWrapper}`]: {
        maxHeight: '125px',
        overflowY: 'auto',
    },

    [`& .${classes.subHeading}`]: {
        color: theme.palette.primary.dark,
    }
}));

function RenderMethodBase(props) {
    const { method } = props;
    const theme = useTheme();
    let chipColor = theme.custom.resourceChipColors ? theme.custom.resourceChipColors[method] : null;
    let chipTextColor = '#000000';
    if (!chipColor) {
        console.log('Check the theme settings. The resourceChipColors is not populated properly');
        chipColor = '#cccccc';
    } else {
        chipTextColor = theme.palette.getContrastText(theme.custom.resourceChipColors[method]);
    }
    return (
        <Chip
            label={method.toUpperCase()}
            style={{
                backgroundColor: chipColor, color: chipTextColor, height: 20, marginRight: 5,
            }}
        />
    );
}

RenderMethodBase.propTypes = {
    method: PropTypes.string.isRequired,
    theme: PropTypes.shape({}).isRequired,
    classes: PropTypes.shape({}).isRequired,
};

const RenderMethod = RenderMethodBase;

class Resources extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            paths: null,
        };
        this.restApi = new Api();
    }

    componentDidMount() {
        const { id } = this.props.api;
        const promisedAPI = this.restApi.getSwagger(id);
        promisedAPI
            .then((response) => {
                if (response.obj.paths !== undefined) {
                    this.setState({ paths: response.obj.paths });
                }
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') console.log(error);
                const { status } = error;
                if (status === 404) {
                    this.setState({ notFound: true });
                } else if (status === 401) {
                    doRedirectToLogin();
                }
            });
    }

    render() {
        const { paths } = this.state;
        if (this.state.notFound) {
            return (
                <div>
                    <FormattedMessage
                        id='Apis.Details.NewOverview.Resources.resource.not.found'
                        defaultMessage='resource not found...'
                    />
                </div>
            );
        }
        if (!paths) {
            return (
                <div>
                    <FormattedMessage
                        id='Apis.Details.NewOverview.Resources.loading'
                        defaultMessage='loading...'
                    />
                </div>
            );
        }
        const {  parentClasses, api } = this.props;
        return (
            (<Root>
                <div className={parentClasses.titleWrapper}>
                    { api.type === 'GraphQL' ? (
                        <Typography id='resources' variant='h5' component='h2' className={parentClasses.title}>
                            <FormattedMessage
                                id='Apis.Details.NewOverview.Operations.operations'
                                defaultMessage='Operation'
                            />
                        </Typography>
                    )
                        : (
                            <Typography id='resources' variant='h5' component='h2' className={parentClasses.title}>
                                <FormattedMessage
                                    id='Apis.Details.NewOverview.Resources.resources'
                                    defaultMessage='Resources'
                                />
                            </Typography>
                        )}
                </div>
                <Box p={1}>
                    <div className={classes.contentWrapper}>
                        {Object.keys(paths).map((key) => {
                            const path = paths[key];
                            return (
                                <div key={key} className={classes.root}>
                                    <Typography className={classes.heading} variant='body1'>
                                        {key}
                                    </Typography>
                                    {Object.keys(path).map((innerKey) => {
                                        return CONSTS.HTTP_METHODS.includes(innerKey)
                                            ? <RenderMethod method={innerKey} /> : null;
                                    })}
                                </div>
                            );
                        })}
                    </div>
                    <Link
                        to={'/apis/' + api.id + '/resources'}
                        id='resource-more'
                        aria-labelledby='resource-more resources'
                    >
                        <Typography
                            className={classes.subHeading}
                            color='primary'
                            display='inline'
                            variant='caption'
                        >
                            <FormattedMessage
                                id='Apis.Details.NewOverview.Operations.ShowMore'
                                defaultMessage='Show More'
                            />
                            <LaunchIcon style={{ marginLeft: '2px' }} fontSize='small' />
                        </Typography>
                    </Link>
                </Box>
            </Root>)
        );
    }
}
Resources.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
    parentClasses: PropTypes.shape({}).isRequired,
    api: PropTypes.shape({ id: PropTypes.string }).isRequired,
};

export default (Resources);
