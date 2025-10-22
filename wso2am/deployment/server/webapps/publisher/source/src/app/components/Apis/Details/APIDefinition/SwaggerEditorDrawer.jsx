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
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import InlineMessage from 'AppComponents/Shared/InlineMessage';
import { FormattedMessage } from 'react-intl';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import CancelIcon from '@mui/icons-material/Cancel';
import IconButton from '@mui/material/IconButton';
import { orange } from '@mui/material/colors';
import differenceBy from 'lodash/differenceBy'
import SwaggerUI from './swaggerUI/SwaggerUI';
import LinterUI from './LinterUI/LinterUI';
import { spectralSeverityNames } from "./Linting/Linting"

const PREFIX = 'SwaggerEditorDrawer';

const classes = {
    editorPane: `${PREFIX}-editorPane`,
    editorRoot: `${PREFIX}-editorRoot`,
    glyphMargin: `${PREFIX}-glyphMargin`,
    noGlyphMargin: `${PREFIX}-noGlyphMargin`,
    topMargin: `${PREFIX}-topMargin`
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.editorPane}`]: {
        width: `calc(50% - ${theme.spacing(1)})`,
        height: '100%',
        overflow: 'auto',
    },

    [`& .${classes.editorRoot}`]: {
        height: '100%',
        marginTop: theme.spacing(-1),
        marginLeft: theme.spacing(-1),
    },

    [`& .${classes.glyphMargin}`]: {
        background: orange[900],
        width: '5px !important'
    },

    [`& .${classes.noGlyphMargin}`]: {
        background: 'none',
    },

    [`& .${classes.topMargin}`]: {
        paddingTop: '10px',   
    }
}));

/**
 * This component hosts the Swagger Editor component.
 * Known Issue: The cursor jumps back to the start of the first line when updating the swagger-ui based on the
 * modification done via the editor.
 * https://github.com/wso2/product-apim/issues/5071
 * */
class SwaggerEditorDrawer extends React.Component {
    /**
     * @inheritDoc
     */
    constructor(props) {
        super(props);
        this.onContentChange = this.onContentChange.bind(this);
        this.editorDidMount = this.editorDidMount.bind(this);
        this.editor = null;
        this.monaco = null;
    }

    /**
     * Method to handle the change event of the editor.
     * @param {string} content : The edited content.
     * */
    componentDidUpdate(prevProps) {
        const {  linterResults } = this.props;
        const linterDifferences = differenceBy(prevProps.linterResults, linterResults, 'range.start.line');

        for (let i=0; i < linterDifferences.length; i++) {
            const {line} = linterDifferences[i].range.start;
            this.editor.deltaDecorations(
                [
                    {
                        range: new this.monaco.Range(line, 1, line, 1),
                        options: {
                            isWholeLine: false,
                            glyphMarginClassName: classes.glyphMargin,
                        }
                    }
                ],
                [
                    {
                        range: new this.monaco.Range(line, 1, line, 1),
                        options: {
                            isWholeLine: false,
                            glyphMarginClassName: classes.noGlyphMargin,
                        }
                    }
                ]
            );
        }
    }

    handleRowClick(line) {
        const columnIndex = this.editor.getModel().getLineLastNonWhitespaceColumn(line);
        this.editor.revealLinesInCenter(line, line, 0);
        this.editor.setPosition({column: columnIndex, lineNumber: line});
        this.editor.focus();

        this.editor.deltaDecorations(
            [],
            [
                {
                    range: new this.monaco.Range(line, 1, line, 1),
                    options: {
                        isWholeLine: false,
                        glyphMarginClassName: classes.glyphMargin,
                    }
                }
            ]
        );
    }

    onContentChange(content) {
        const {onEditContent} = this.props;
        onEditContent(content);
    }

    editorDidMount(editor, monaco) {
        const { linterSelectedLine } = this.props;
        this.editor = editor;
        this.monaco = monaco;
        if (linterSelectedLine) {
            this.handleRowClick(linterSelectedLine);
        }
    }

    /**
     * @inheritDoc
     */
    render() {
        const { language, swagger, errors, setErrors, isSwaggerUI, linterResults, severityMap, 
            linterSelectedSeverity } = this.props;
        return (
            <Root>
                <Grid container spacing={2} className={classes.editorRoot}>
                    <Grid item className={classes.editorPane}>
                        <MonacoEditor
                            language={language}
                            width='100%'
                            height='calc(100vh - 51px)'
                            theme='vs-dark'
                            value={swagger}
                            onChange={this.onContentChange}
                            options={{ glyphMargin: true }}
                            onMount={this.editorDidMount}
                        />
                    </Grid>
                    <Grid item className={classes.editorPane}>
                        {(errors && errors.length > 0) && (
                            <Box mr={2}>
                                <InlineMessage type='warning' height='100%'>
                                    <Box>
                                        <Box onClick={setErrors} position='absolute' right='0' top='0'>
                                            <IconButton area-label='close' size='large'>
                                                <CancelIcon />
                                            </IconButton>
                                        </Box>
                                        <Typography
                                            variant='h5'
                                            component='h3'
                                            className={classes.head}
                                        >
                                            <FormattedMessage
                                                id='Apis.Details.APIDefinition.SwaggerEditorDrawer.title'
                                                defaultMessage='Failed to Validate OpenAPI File'
                                            />
                                        </Typography>
                                        {errors.map((e) => (
                                            <Typography component='p' className={classes.content}>
                                                {e.description}
                                            </Typography>
                                        ))}
                                    </Box>
                                </InlineMessage>
                            </Box>
                        )}
                        { isSwaggerUI && (
                            <SwaggerUI spec={swagger} />
                        )}
                        { !isSwaggerUI && linterResults.length > 0 && (
                            <div data-testid='testid-linter-ui'>
                                <LinterUI
                                    linterResults={linterResults}
                                    severityMap={severityMap}
                                    handleRowClick={(line) => {this.handleRowClick(line)}}
                                />
                            </div>
                        )}
                        { !isSwaggerUI && linterResults.length === 0 && (
                            <div className={classes.topMargin}>
                                <Box alignSelf='center' justifySelf='center' flexDirection='column'>
                                    <Typography variant='h4'>
                                        <FormattedMessage
                                            id={'Apis.Details.APIDefinition.SwaggerEditorDrawer.linter.good'
                                                + 'update.content'}
                                            defaultMessage='No linting issues found in the definition'
                                        />
                                    </Typography>
                                    <Typography variant='h6'>
                                        <FormattedMessage
                                            id={'Apis.Details.APIDefinition.SwaggerEditorDrawer.linter.no.results'
                                                + 'update.content'}
                                            defaultMessage='No Linter Results{type} found'
                                            values={{type: linterSelectedSeverity?
                                                ` (${spectralSeverityNames[linterSelectedSeverity]})`:''}}
                                        />
                                    </Typography>
                                </Box>
                            </div>
                        )}
                    </Grid>
                </Grid>
            </Root>
        );
    }
}

SwaggerEditorDrawer.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    language: PropTypes.string.isRequired,
    swagger: PropTypes.string.isRequired,
    onEditContent: PropTypes.func.isRequired,
    errors: PropTypes.shape([]).isRequired,
    setErrors: PropTypes.func.isRequired,
};

export default (SwaggerEditorDrawer);
