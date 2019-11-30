/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function (config) {
    // Define changes to default configuration here. For example:
    // config.language = 'fr';
    // config.uiColor = '#AADC6E';
    config.entities = false;
    config.extraPlugins = 'base64image,imageresize,lineutils,clipboard,widget,btgrid';
    config.toolbar = [
        {name: 'document', items: ['Source', '-', 'Templates']},
        {name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'SelectAll', '-', 'Undo', 'Redo']},
        {name: 'editing', items: ['Find', 'Replace']},
        {name: 'links', items: ['Link', 'Unlink', 'Anchor']},
        {name: 'insert', items: ['Btgrid', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe', 'base64image']},
        {name: 'tools', items: ['BidiLtr', 'BidiRtl', '-', 'Maximize', 'ShowBlocks', '-', 'Blockquote', 'CreateDiv']},
        '/',
        {name: 'styles', items: ['RemoveFormat', 'Styles', 'Format', 'Font', 'FontSize', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']},
        {name: 'colors', items: ['TextColor', 'BGColor']},
        {name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript']},
        {name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent']}
    ];
};
