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

import React, {useState, useRef, useContext} from 'react';
import { styled } from '@mui/material/styles';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Icon from '@mui/material/Icon';
import Paper from '@mui/material/Paper';
import Api from 'AppData/api';
import APIContext from 'AppComponents/Apis/Details/components/ApiContext';
import GenerateDocument from './GenerateDocument';


const PREFIX = 'ViewDocument';

const classes = {
    appBar: `${PREFIX}-appBar`,
    flex: `${PREFIX}-flex`,
    popupHeader: `${PREFIX}-popupHeader`,
    splitWrapper: `${PREFIX}-splitWrapper`,
    docName: `${PREFIX}-docName`,
    button: `${PREFIX}-button`,
    viewButton: `${PREFIX}-viewButton`
};


const Root = styled('div')({
    [`& .${classes.appBar}`]: {
        position: 'relative',
    },
    [`& .${classes.flex}`]: {
        flex: 1,
    },
    [`& .${classes.popupHeader}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    [`& .${classes.splitWrapper}`]: {
        padding: 0,
    },
    [`& .${classes.docName}`]: {
        alignItems: 'center',
        display: 'flex',
    },
    [`& .${classes.button}`]: {
        height: 30,
        marginLeft: 30,
    },
    [`& .${classes.viewButton}`]: {
        whiteSpace: 'nowrap',
        marginRight: 50,
    },
});

function Transition(props) {
    return <Slide direction='up' {...props} />;
}

function ViewDocument(props) {
    const restAPI = new Api();

    const { intl, apiType } = props;
    const [open, setOpen] = useState(false);
    const [saveDisabled, setSaveDisabled] = useState(false);
    let createEditForm = useRef(null);
    const { api } = useContext(APIContext);

    const toggleOpen = () => {
        setOpen(!open);
    };

    const {  apiId, docName } = props;
    return (
        <Root>
            <Button
                id='view-generated-document-btn'
                data-testid='view-generated-document-btn'
                variant='contained'
                color='primary'
                onClick={toggleOpen}
                className={classes.viewButton}
                aria-label={'View Content of ' + docName}
            >
                <FormattedMessage
                    id='Apis.Details.Documents.ViewDocument.view.document'
                    defaultMessage='View Document'
                />
            </Button>
            <Dialog open={open} onClose={toggleOpen} TransitionComponent={Transition} fullScreen> 
                <Paper square className={classes.popupHeader}>
                        <IconButton color='inherit' onClick={toggleOpen} aria-label='Close' size='large'>
                            <Icon>close</Icon>
                        </IconButton>
                </Paper>
                <div className='apim_elements'><GenerateDocument /></div>
                
            </Dialog>
        </Root>
    );
}
ViewDocument.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    apiId: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({}).isRequired,
};

export default injectIntl((ViewDocument));
