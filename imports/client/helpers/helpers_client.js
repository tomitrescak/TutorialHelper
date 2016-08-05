import moment from 'moment';
import marked from 'marked';
import sAlert from 'react-s-alert';
import swal from 'sweetalert2';
import mf from '../configs/i18n';
import store from '../configs/store';
import { push } from 'react-router-redux';
export const RouterUtils = {
    encodeUrlName(name) {
        let result = name.replace(/\:/g, '');
        result = result.replace(/ - /g, '-');
        result = result.replace(/\W/g, '-');
        return result.replace(/--/g, '-');
    },
    go(route) {
        store.dispatch(push(route));
    }
};
let saveFunction;
let saveCallback;
const saveListener = function (e) {
    if (e.keyCode === 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        saveFunction(); // UiUtils.announceSaved()
        if (saveCallback) {
            saveCallback();
        }
    }
};
export const UiUtils = {
    datePicker(elem, context, field) {
        $(elem).pickadate({
            format: 'dd mmm yyyy',
            onSet: function (value) {
                context[field] = new Date(value.select);
            }
        });
    },
    niceDate(date) {
        if (date) {
            return moment(date).format('DD MMM YYYY');
        }
        return '';
    },
    fullDate(date) {
        if (date) {
            return moment(date).format('DD MMM YYYY, HH:mm');
        }
        return '';
    },
    relativeDate(date) {
        if (date) {
            return moment(date).fromNow();
        }
        return '';
    },
    previewMarkdown(text, length) {
        if (!text) {
            return '';
        }
        if (length == null) {
            length = text.length;
        }
        let html = marked(text);
        let regex = /(<([^>]+)>)/ig;
        html = html.replace(regex, '');
        // find a good cutoff position
        while (html[length] !== ' ' && length < html.length) {
            length++;
        }
        html = html.substring(0, length + 1);
        html = html.replace(/(\r|\n)/, ' ');
        // remove all double spaces
        while (html.indexOf('  ') >= 0) {
            html = html.replace(/  /g, ' ');
        }
        // add elipsis
        if (text.length > length) {
            html += '...';
        }
        return html;
    },
    hResize(lDiv, rDiv, marker, evt) {
        return function (e) {
            let minLeft = lDiv.position().left + 50;
            let maxRight = rDiv.position().left + rDiv.width() - 50;
            if (e.clientX > minLeft && e.clientX < maxRight) {
                lDiv.css('right', (((window.innerWidth - e.clientX) / window.innerWidth) * 100) + '%');
                rDiv.css('left', ((e.clientX / window.innerWidth) * 100) + '%');
                marker.css('left', ((e.clientX / window.innerWidth) * 100) + '%');
                // notify clients on resizing event
                evt.emit(); // type of EventObject 
            }
        };
    },
    relativeResize(lDiv, rDiv, marker, evt) {
        return function (e) {
            let left = lDiv.offset().left;
            let relativeWindow = window.innerWidth - left;
            let relativePosition = e.clientX - left;
            let minLeft = left + 150;
            let maxRight = window.innerWidth - 300;
            if (e.clientX > minLeft && e.clientX < maxRight) {
                lDiv.css('width', ((relativePosition / relativeWindow) * 100) + '%');
                rDiv.css('width', (((relativeWindow - relativePosition) / relativeWindow) * 100) + '%');
                marker.css('left', ((relativePosition / relativeWindow) * 100) + '%');
                // notify clients on resizing event
                evt.emit();
            }
        };
    },
    resizer(left, right, resizer, evt) {
        const hresize = UiUtils.relativeResize($(left), $(right), $(resizer), evt);
        window.addEventListener('mousemove', hresize, true);
        window.addEventListener('mouseup', function () {
            window.removeEventListener('mousemove', hresize, true);
        }, true);
        return false;
    },
    pageTransition() {
        $('html, body').animate({ scrollTop: 0 }, 400);
        $('#main').hide().fadeIn(1000);
    },
    removeSaveListener() {
        document.removeEventListener('keydown', saveListener);
    },
    registerSaveListener(saveFunc, callback) {
        saveFunction = saveFunc;
        saveCallback = callback;
        // TODO: ApplicationState.editor = obj;
        UiUtils.removeSaveListener();
        document.addEventListener('keydown', saveListener, false);
    },
    alert(text, params, options) {
        sAlert.success(mf(text, params), options);
    },
    alertError(text, params, options) {
        sAlert.error(mf(text, params), options);
    },
    announce(infoText, errorText, callback) {
        return (error, value) => {
            if (error) {
                if (error.reason != null || error.details != null) {
                    sAlert.error(mf(errorText) + ': ' + (error.reason ? error.reason : error.details), { type: 'error' });
                }
                else {
                    sAlert.error(error.toString());
                }
            }
            else {
                sAlert.success(mf(infoText));
            }
            if (callback) {
                callback(error, value);
            }
        };
    },
    announceCreated(callback) {
        return UiUtils.announce('info.createSuccess', 'info.createError', callback); // mf('info.createSuccess', ''); mf('info.createError', '');
    },
    announceSaved(callback) {
        return UiUtils.announce('info.saveSuccess', 'info.saveError', callback); // mf('info.saveSuccess', ''); mf('info.saveError', '');
    },
    announceDeleted(callback) {
        return UiUtils.announce('info.deleted', 'info.deleteFailed', callback); // mf('info.deleted', ''); mf('info.deleteFailed', '');
    },
    announceDuplicated(callback) {
        return UiUtils.announce('info.duplicated', 'info.duplicateFailed', callback); // mf('info.duplicated', ''); mf('info.duplicateFailed', '');
    },
    showMarkdownModal(raw, header) {
        let html = marked(raw);
        html = html.replace(/<table/g, '<table class=\'ui striped table\'');
        // now fill in the data
        $('#previewModalHeader').html(header ? mf(header) : mf('description'));
        let content = raw[0] === '?' ? mf(html) : html;
        content = UiUtils.parseText(content);
        $('#previewModalContent').html(content);
        $('#previewModal').modal('show');
        setTimeout(function () {
            $('#previewModal').modal('refresh');
        }, 1000);
    },
    alertDialog(title, text, type = 'error') {
        swal(mf(title), mf(text), type);
    },
    confirmDialog(callback, text = 'deletingRecord', title = 'areYouSure', confirmButtonText = 'deleteIt', type = 'warning', closeOnConfirm = true) {
        swal({
            title: mf(title),
            text: mf(text),
            type: type,
            showCancelButton: true,
            confirmButtonText: mf(confirmButtonText)
        }).then(callback);
    },
    promptText(callback, prompt, placeholder = '', validate = (val) => val) {
        let title = mf(prompt);
        swal({
            title: mf(prompt),
            input: 'text',
            inputPlaceholder: placeholder[0] === '!' ? mf(placeholder.substring(1)) : placeholder,
            showCancelButton: true,
            inputValidator: function (value) {
                return new Promise(function (resolve, reject) {
                    if (validate(value)) {
                        resolve();
                    }
                    else {
                        reject(mf('validationError'));
                    }
                });
            }
        }).then(function (result) {
            callback(result);
        });
    },
    promptOptions(callback, prompt, placeholder, options, validate = (val) => val) {
        swal({
            title: mf(prompt),
            input: 'select',
            inputOptions: options,
            inputPlaceholder: mf(placeholder),
            showCancelButton: true,
            // onOpen: () => {
            //   $('.swal2-select').dropdown();
            //
            //   let sel = $('.swal2-select')[0];
            //   Object.defineProperty(sel, 'value', {
            //     get: function() {
            //       return $('.swal2-modal select').val();
            //     },
            //     set: function(val: string) {
            //      // nothing
            //     }
            //   });
            // },
            inputValidator: function (value) {
                return new Promise(function (resolve, reject) {
                    if (validate(value)) {
                        resolve();
                    }
                    else {
                        reject(mf('validationError'));
                    }
                });
            }
        }).then(function (result) {
            callback(result);
        });
    },
    deletedDialog() {
        swal(mf('deleted'), mf('recordDeleted'), 'success');
    },
    parseMarkdown(text) {
        return marked(UiUtils.parseText(text));
    },
    parseText(text) {
        return text ? text.replace(/img src='/g, 'img src=\'' + process.env.awsBucket) : '';
    }
};
export const ClassUtils = {
    groupByArray(xs, key) {
        return xs.reduce(function (rv, x) {
            let v = key instanceof Function ? key(x) : x[key];
            let el = rv.find((r) => r && r.key === v);
            if (el) {
                el.values.push(x);
            }
            else {
                rv.push({
                    key: v,
                    values: [x]
                });
            }
            return rv;
        }, []);
    },
    groupByObject(xs, key) {
        return xs.reduce(function (rv, x) {
            let v = key instanceof Function ? key(x) : x[key];
            (rv[v] = rv[v] || []).push(x);
            return rv;
        }, {});
    },
    indexArray(arr) {
        if (arr.length === 0) {
            return arr;
        }
        if (typeof arr[0] === 'string') {
            let arr1 = [];
            for (let i = 0; i < arr.length; i++) {
                arr1.push({ value: arr[i], index: i, nextIndex: i + 1 });
            }
            return arr1;
        }
        else {
            for (let i = 0; i < arr.length; i++) {
                arr[i].index = i;
                arr[i].nextIndex = i + 1;
            }
        }
        return arr;
    },
    find(obj, callback) {
        let props = Object.getOwnPropertyNames(obj);
        for (let prop of props) {
            if (callback(obj[prop])) {
                return obj[prop];
            }
        }
        return null;
    }
};
