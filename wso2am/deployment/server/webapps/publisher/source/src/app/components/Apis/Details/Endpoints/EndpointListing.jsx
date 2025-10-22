/**
 * Copyright (c)  WSO2 Inc. (http://wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect, useRef, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Grid } from '@mui/material';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import GenericEndpoint from './GenericEndpoint';
import GenericEndpointAdd from './GenericEndpointAdd';

const PREFIX = 'EndpointListing';

const classes = {
    endpointInputWrapper: `${PREFIX}-endpointInputWrapper`,
    epInput: `${PREFIX}-epInput`,
    epTypeWrapper: `${PREFIX}-epTypeWrapper`,
    epTypeName: `${PREFIX}-epTypeName`,
    epConfig: `${PREFIX}-epConfig`,
    leftArrow: `${PREFIX}-leftArrow`,
    leftArrowLight: `${PREFIX}-leftArrowLight`,
    dialogHeader: `${PREFIX}-dialogHeader`,
    listItemOdd: `${PREFIX}-listItemOdd`,
    listItem: `${PREFIX}-listItem`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.endpointInputWrapper}`]: {
        display: 'flex',
    },

    [`& .${classes.epInput}`]: {
        width: '100%',
    },

    [`& .${classes.epTypeWrapper}`]: {
        display: 'flex',
        padding: '5px',
    },

    [`& .${classes.epTypeName}`]: {
        paddingTop: '10px',
        fontWeight: 600,
    },

    [`& .${classes.epConfig}`]: {
        justifyContent: 'flex-end',
    },

    [`& .${classes.leftArrow}`]: {
        paddingTop: '6px',
    },

    [`& .${classes.leftArrowLight}`]: {
        color: '#c5c5c5',
        paddingTop: '6px',
    },

    [`& .${classes.dialogHeader}`]: {
        fontWeight: 600,
    },

    [`& .${classes.listItemOdd}`]: {
        background: '#ececec',
        borderRadius: '5px',
        '&:hover': {
            backgroundColor: theme.palette.grey[300],
        },
        '&:focus': {
            backgroundColor: theme.palette.grey[400],
        },
    },

    [`& .${classes.listItem}`]: {
        borderRadius: '5px',
        '&:hover': {
            backgroundColor: theme.palette.grey[300],
        },
        '&:focus': {
            backgroundColor: theme.palette.grey[400],
        },
    }
}));

/**
 * The Component for endpoint listing.
 * @param {*} props The props that are being passed to the component.
 * @returns {any} The HTML view of the ep listing component.
 */
function EndpointListing(props) {
    const {
        category,
        apiEndpoints,
        epType,
        failOvers,
        editEndpoint,
        addNewEndpoint,
        removeEndpoint,
        setAdvancedConfigOpen,
        setESConfigOpen,
        apiId,
        componentValidator,
    } = props;
    const [endpointType, setEndpointType] = useState(epType);
    const [endpoints, setEndpoints] = useState([{ url: 'http://myservice/endpoint' }]);
    const selectedRef = useRef(null);

    /**
     * Method to add a new endpoint.
     *
     * @param {string} url The url of the endpoint that needs to be added.
     * */
    const addEndpoint = (url) => {
        addNewEndpoint(category, epType, url);
    };

    useEffect(() => {
        setEndpointType(epType);
        setEndpoints(() => {
            if (apiEndpoints !== null && epType === 'failover') {
                return ([apiEndpoints].concat(failOvers));
            } else {
                if (apiEndpoints !== undefined) {
                    return Array.isArray(apiEndpoints) ? apiEndpoints : [apiEndpoints];
                }
                return [{ url: 'http://myservice/' }];
            }
        });
    }, [props]);

    return (
        <Root className={classes.listingWrapper} ref={selectedRef}>
            <Grid container xs={12}>
                <Grid xs={12}>
                    {(endpointType === 'failover' || endpointType === 'load_balance') ?
                        <GenericEndpointAdd
                            addEndpoint={addEndpoint}
                            endpointType={endpointType}
                            category={category}
                        /> : <div />
                    }
                </Grid>
                <Grid xs={12}>
                    {
                        (endpoints.map((ep, index) => {
                            if (index > 0) {
                                return (
                                    <GenericEndpoint
                                        readOnly
                                        endpointURL={endpoints[index] ? endpoints[index].url : ''}
                                        type={endpointType}
                                        index={index}
                                        category={category}
                                        editEndpoint={editEndpoint}
                                        deleteEndpoint={removeEndpoint}
                                        setAdvancedConfigOpen={setAdvancedConfigOpen}
                                        setESConfigOpen={setESConfigOpen}
                                        apiId={apiId}
                                        componentValidator={componentValidator}
                                    />
                                );
                            }
                            return (<div />);
                        }))
                    }
                </Grid>
            </Grid>
        </Root>
    );
}

EndpointListing.propTypes = {
    classes: PropTypes.shape({
        epTypeWrapper: PropTypes.shape({}),
        epTypeName: PropTypes.shape({}),
        listingWrapper: PropTypes.shape({}),
        epConfig: PropTypes.shape({}),
    }).isRequired,
    epType: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    apiEndpoints: PropTypes.shape({}).isRequired,
    failOvers: PropTypes.shape({}).isRequired,
    addNewEndpoint: PropTypes.func.isRequired,
    removeEndpoint: PropTypes.func.isRequired,
    editEndpoint: PropTypes.func.isRequired,
    setAdvancedConfigOpen: PropTypes.func.isRequired,
    setESConfigOpen: PropTypes.func.isRequired,
    apiId: PropTypes.string.isRequired,
};

export default injectIntl((EndpointListing));
