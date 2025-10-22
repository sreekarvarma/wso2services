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
import React, { Suspense, useState } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import { Toolbar } from '@mui/material';
import Fade from '@mui/material/Fade';
import CircularProgress from '@mui/material/CircularProgress';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import Alert from 'AppComponents/Shared/Alert';
import Grid from '@mui/material/Grid';
import Banner from 'AppComponents/Shared/Banner';
import { FormattedMessage, useIntl } from 'react-intl';
import CloseConfirmation from './CloseConfirmation';

const PREFIX = 'PolicyEditor';

const classes = {
    appBar: `${PREFIX}-appBar`,
    title: `${PREFIX}-title`
};

const StyledDialog = styled(Dialog)((
    {
        theme
    }
) => ({
    [`& .${classes.appBar}`]: {
        // position: 'relative',
        top: 'auto',
        bottom: 0,
    },

    [`& .${classes.title}`]: {
        marginLeft: theme.spacing(2),
        flex: 1,
    }
}));

const Transition = React.forwardRef((props, ref) => {
    return <Fade in ref={ref} {...props} />;
});

/**
 *
 *
 * @export
 * @returns
 */
export default function PolicyEditor(props) {

    const [api] = useAPI();
    const intl = useIntl();
    const {
        open,
        onClose,
        prefersDarkMode,
        originalResourcePolicy,
        selectedPolicy,
        setPolicyContent,
        resourcePoliciesDispatcher,
        direction,
    } = props;
    const [pageError, setPageError] = useState(null);
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [saving, setSaving] = useState(false);

    const editorOptions = {
        selectOnLineNumbers: true,
        readOnly: saving,
        smoothScrolling: true,
        wordWrap: 'on',
    };
    const editorProps = {
        language: 'xml',
        height: 'calc(100vh)',
        theme: prefersDarkMode ? 'vs-dark' : 'vs',
        value: selectedPolicy.content,
        options: editorOptions,
        onChange: setPolicyContent,
    };

    /**
     *
     *
     */
    function confirmAndClose() {
        // No need to confirm if user have not done any changes
        if (selectedPolicy.content !== originalResourcePolicy.content) {
            setOpenConfirmation(true);
        } else {
            onClose();
        }
    }
    /**
     *
     *
     */
    function save() {
        setSaving(true);
        api.updateResourcePolicy(selectedPolicy)
            .then((response) => {
                Alert.success(intl.formatMessage({
                    id: 'Apis.Details.Resources.Policy.update.success',
                    defaultMessage: 'Resource policy updated successfully',
                }));
                resourcePoliciesDispatcher({ action: 'update', data: { value: response.body, direction } });
                onClose();
            })
            .catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                    setPageError(error.response.body);
                } else {
                    // TODO add i18n ~tmkb
                    const message = error.message
                        || intl.formatMessage({
                            id: 'Apis.Details.Resources.Policy.update.error',
                            defaultMessage: 'Something went wrong while updating resource policy!',
                        });
                    Alert.error(message);
                    setPageError(message);
                }
                console.error(error);
            })
            .finally(() => setSaving(false));
    }

    return (
        <StyledDialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
            <AppBar position='fixed' color='default' className={classes.appBar}>
                <Toolbar variant='dense'>
                    <Grid container direction='row' justifyContent='flex-start' alignItems='flex-start'>
                        <Grid item>
                            <Button
                                disabled={saving}
                                variant='outlined'
                                color='primary'
                                className={classes.title}
                                onClick={save}
                            >
                                <FormattedMessage
                                    id='Apis.Details.Resources.Policy.Dialog.save.and.close.btn'
                                    defaultMessage='save & close'
                                />
                                {saving && <CircularProgress size={18} />}
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button color='inherit' className={classes.title} onClick={confirmAndClose}>
                                <FormattedMessage
                                    id='Apis.Details.Resources.Policy.Dialog.close.editor.btn'
                                    defaultMessage='close'
                                />
                            </Button>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
            <Grid container direction='row' justifyContent='center' alignItems='center'>
                {pageError && (
                    <Grid item xs={12}>
                        <Banner
                            onClose={() => setPageError(null)}
                            disableActions
                            dense
                            paperProps={{ elevation: 1 }}
                            type='error'
                            message={pageError}
                        />
                    </Grid>
                )}
            </Grid>
            <Grid item xs={12}>
                <Suspense fallback={<CircularProgress disableShrink />}>
                    <MonacoEditor {...editorProps} />
                </Suspense>
            </Grid>
            <CloseConfirmation
                open={openConfirmation}
                onClose={() => {
                    setPolicyContent(originalResourcePolicy.content);
                    setOpenConfirmation(false);
                }}
                closeEditor={onClose}
            />
        </StyledDialog>
    );
}
PolicyEditor.defaultProps = {
    open: false,
    onClose: () => {},
    prefersDarkMode: false,

};
PolicyEditor.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    prefersDarkMode: PropTypes.bool,
    originalResourcePolicy: PropTypes.shape({}).isRequired,
    selectedPolicy: PropTypes.shape({}).isRequired,
    setPolicyContent: PropTypes.func.isRequired,
    resourcePoliciesDispatcher: PropTypes.func.isRequired,
    direction: PropTypes.oneOf(['in', 'out']).isRequired,
};
