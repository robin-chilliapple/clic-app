/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * 'License'); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    currentView: 'login',
    apiUrl: '',
    baseUrl: '',
    theme: '',
    payment: 'Company Debit',
    uploadType: 'expense',
    foldersStack: [],
    tempImage: null,
    images: [],

    initialize: function() {
        this.onDeviceReady();
        this.bindCalls();
        FastClick.attach(document.body);
    },

    // deviceready Event Handler
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        $(document).ready(function() {
            app.loadConfig(function () {
                app.getImage();

                if (app.theme == 'clic') {
                    app.prepareHomePage();
                }

                $.get(app.apiUrl + 'check?token=' + window.localStorage.getItem('token'), function(data) {
                    if (!data.success) {
                        app.loadScreen('login');
                    } else {
                        app.loadScreen('index');
                    }
                });
            });
        });
    },

    loadConfig: function (cb) {
         $.get('./config.xml', function (data) {
             app.baseUrl = $(data).find('config > api').attr('url');
             app.apiUrl = app.baseUrl + 'api/';
             app.theme = $(data).find('config > app').attr('theme');

             cb();
         });
    },

    getImage: function() {
        var remoteSource = null;
        var pageImages = $('.page-image');
        $.get(app.apiUrl + 'image', function(data) {
            remoteSource = data.image;
            pageImages.attr('src', remoteSource);
        });
    },

    prepareHomePage:function() {
        var offset = 0;
        var totalHeight = $(window).height();
        var totalWidth = $(window).width();
        var contentHeight =  237;
        if (totalWidth <= 360) {
            offset = 11;
            contentHeight = 197;
        }
        var headerHeight = 151.48;
        var bottomHeight = 77;
        var imageHeight = (totalWidth / 532) * 239;
        var containerHeight = totalHeight - headerHeight - imageHeight - bottomHeight;
        var padding = containerHeight - contentHeight;
        var topPadding = 0.588 * padding + 7.5 + offset + 'px';
        var bottomPadding = 0.412 * padding + 'px';
        $('.content-container').css('padding-top', topPadding).css('padding-bottom', bottomPadding);
    },

    bindCalls: function() {
        $('[data-call]').off('click').on('click', function(e) {
            e.preventDefault();
            var fn = app[$(this).data('call')];
            if (typeof fn === 'function') {
                //console.log($(this).data('param'));
                if ($(this).data('param')) {
                    fn($(this).data('param'));
                } else {
                    fn();
                }
            } else {
                alert('Function ' + $(this).data('call') + ' is not defined.');
            }
        });

        //Passes the index of the current menu item to menuActivate when a menu item is clicked
        $('.upload-button, .menu-item, .settings-icon, .logo-container, .home-button').click(function() {
            var el = $(this);
            var index = el.data('index');
            app.menuActivate(index);
        });


        $('#payment-select').on('change', function(e) {
            if ($(this).val() == 'Other'){
                $('#payment-other').removeClass('hidden');
            } else{
                $('#payment-other').addClass('hidden');
            }
        });

        app.bindBackButton();
        app.bindUploadFilesButton();
        app.bindSubmitPaymentButton();
        app.bindFileTypeDropdown();
        app.bindClearFiles();
    },

    bindClearFiles: function() {
        $('#clear-files').click(function() {
            app.images.length = 0;
            $('#upload-status').html('');
            app.showIndex();
        });
    },

    bindFileTypeDropdown: function() {
        $('#file-type').on('change', function() {
            app.uploadType = $(this).val();
            if ($(this).val() == 'document') {
                $('#payment-method').hide();
            } else {
                $('#payment-method').show();
            }
        });
    },

    bindExpenseButtons: function() {
        $('.view-expense').click(function(){
            var imageRow = $('#' + $(this).data('image'));
            if(imageRow.hasClass('hidden')){
                imageRow.removeClass('hidden');
            }
            else{
                imageRow.addClass('hidden');
            }
        });
    },

    alert: function(message, callBack, title, buttonName) {
        navigator.notification.alert(
            message,
            callBack,
            title,
            buttonName
        );
    },

    prompt: function(message, callBack, title, buttonLabels) {
        navigator.notification.confirm(
            message,
            callBack,
            title,
            buttonLabels
        );
    },

    menuActivate: function(itemIndex) {
        //Force menu highlight when screen is payment - index value doesn't get passed through properly.
        if(app.currentView == 'payment') {
            itemIndex = 1;
        }
        //Remove class active from the active menu item then highlights the menu item with
        //the corresponding index value on the new page
        $('.active').removeClass('active');
        $('#' + app.currentView + ' [data-index=' + itemIndex + ']').addClass('active');
    },

    // Hide all screens then load the specified screen
    loadScreen: function(screen) {
        app.currentView = screen;
        $('.screen').hide();
        $('#' + screen).show();

        // if (app.currentView == 'index') {
        //     $('.menu-bar').css('background-image' , 'none');
        // } else {
        //     $('.menu-bar').css('background-image' , 'url(../www/img/background-pattern.png)');
        // }
    },

    processLogin: function() {
        $.ajaxSetup({timeout:30000});

        var email = encodeURI($('#login-email').val());
        var password = encodeURI($('#login-password').val());
        $.get(app.apiUrl + 'signin?email=' + email + '&password=' + password, function(data) {
            if (!data.success) {
                if(data.key == 'unauthorised_access') {
                    app.alert('Access denied.', null, 'Unauthorised access', 'OK');
                } else {
                    app.alert('Sorry, your username or password was incorrect. Please try again.', null, 'Incorrect Details', 'OK');
                }
            } else {
                window.localStorage.setItem('token', data.token);
                app.showIndex();
            }
        });
    },
    logout: function() {
        window.localStorage.clear();
        app.showLogin();
    },

    showLogin: function() {
        app.loadScreen('login');
    },

    showIndex: function() {
        app.loadScreen('index');
    },

    showUpload: function() {
        app.loadScreen('upload');
    },

    showExpenses: function() {
        app.loadScreen('expenses');
        app.getExpenses();
    },

    getExpenses: function() {
        var table = $('#expenses-table tbody');
        table.empty();

        $.get(app.apiUrl + 'expenses?token=' + window.localStorage.getItem('token'), function(data) {
            if (data.success) {
                for (var x in data['expenses']) {
                    var time = data['expenses'][x]['created_at'].substr(10, 6);
                    var date = data['expenses'][x]['created_at'].substr(0, 10).split('-').reverse().join('/');
                    var status = 'Pending';
                    if (data['expenses'][x]['approved_at'] != null) {
                        status = 'Processed';
                    }
                    var item = '<tr>\
                      <td>' + date + '</td> \
                      <td>' + time + '</td>\
                      <td>' + status + '</td>\
                      <td><a class="btn btn-primary btn-sm view-expense" data-image="image'+ data['expenses'][x]['id'] +'">View</a></td>\
                      </tr>\
                      <tr id="image'+ data['expenses'][x]['id'] +'" class="expense-image-row hidden">\
                      <td colspan="4"><img src="' + app.baseUrl + 'uploads' + data['expenses'][x]['attachment'] + '" class="img-responsive" style="width: 100%; max-height: auto;"></td>\
                      </tr>';
                    table.append(item);
                }
                app.bindExpenseButtons();
            } else {
                app.alert('You are not logged in. Please login to continue.', app.loadScreen('login'), 'Login Required', 'OK');

            }
        });
    },

    showPayment: function() {
        app.loadScreen('payment');
    },

    showDocType: function() {
        app.loadScreen('upload-quantity')
    },

    showFiles: function() {
        app.loadScreen('files');
        app.foldersStack = [];
        app.toggleFilesHeading();
        app.getFolders();
    },

    showContact: function() {
        app.loadScreen('contact');
        app.getContactDetails();
    },

    showSettings: function() {
        app.loadScreen('settings');
    },

    getContactDetails: function() {
        $.get(app.apiUrl + 'bookkeeper?token=' + window.localStorage.getItem('token'), function(data) {
            if (data.success) {
                var hash = data.hash;
                $('#gravatar').attr('src', 'https://www.gravatar.com/avatar/'+hash);
                $('#contact-name').html(data.bookkeeper.name);
                $('#contact-number').html(data.bookkeeper.telephone);
                $('#contact-email').html('<a href="mailto:' + data.bookkeeper.email + '">' + data.bookkeeper.email + '</a>');
            } else {
                app.alert('You are not logged in. Please login to continue.', app.loadScreen('login'), 'Login Required', 'OK');
            }
        });
    },

    toggleFilesHeading: function() {
        if (app.foldersStack.length > 0) {
            $('#folder-name').html(app.foldersStack[app.foldersStack.length-1].split(':')[1]);
            $('#back').removeClass('hidden');
        } else {
            $('#folder-name').text('All Folders');
            $('#back').addClass('hidden');
        }
    },

    bindFilesAndFolders: function() {
        $('.folder').click(function() {
            var folder = $(this);
            var folderId = folder.data('id');
            var folderName = folder.text().trim();
            var folderData = folderId + ':' + folderName;
            app.foldersStack.push(folderData);
            app.toggleFilesHeading();
            app.getFolders(folderId);
        });
    },

    bindBackButton: function() {
        $('#back').click(function() {
            app.foldersStack.pop();
            if (app.foldersStack.length > 0) {
                var folderId = app.foldersStack[app.foldersStack.length - 1].split(':')[0];
                app.toggleFilesHeading();
                app.getFolders(folderId);
            } else {
                $(this).addClass('hidden');
                $(this).data('current-id', '');
                app.toggleFilesHeading();
                app.getFolders('');
            }
        });
    },

    getFolders: function(folderId) {
        //Clears the element holding file/folder items
        $('#file-container').empty();
        //Changes the route depending on whether or not a folder ID has been given
        //No folder ID = retrieve all folders in the root directory
        //Folder ID = retrieve files and folders inside the selected folder
        var route = app.apiUrl+'folders?token=' + window.localStorage.getItem('token');
        if (folderId && folderId > 0){
            route = app.apiUrl+'folders?token=' + window.localStorage.getItem('token')+'&'+'folderId='+folderId;
        }
        $.get(route, function(data) {
            if (data.success) {
                var fileContainer = $('#file-container');
                var array = data['folders'];
                var length = data['folders'].length;
                var item;
                if (data['files'] != null) {
                    array = data['folders'].concat(data['files']);
                    length = array.length;
                }
                if (length <= 0) {
                    fileContainer.append('<p>There is no content in this folder.</p>');
                } else {
                    for (var x = 0; x < length; x++) {
                        if (x < data['folders'].length) {
                            if ($('#folder-' + array[x]['id']).length <= 0) {
                                item = '<div id ="folder-'+ array[x]['id'] +'" class="col-xs-12 file-item folder" data-id = "'+ array[x]['id'] +'" data-parent="' + array[x]['parent_id'] +'">\
                                  <span>' + array[x]['name'] + '</span>\
                                  </div>';
                                fileContainer.append(item);
                            }
                        } else {
                            if ($('#file-' + array[x]['id']).length <= 0) {
                                item = '<div id ="file-' + array[x]['id'] + '" class="col-xs-12 file-item file" onclick="window.open(\'' + app.baseUrl + 'files/' + array[x]['id'] + '?token=' + window.localStorage.getItem('token') + '\', \'_system\');">\
                                  <i class="fa fa-file-text-o icon-small" aria-hidden="true"></i><span>' + array[x]['name'] + '</span>\
                                  </div>';
                                fileContainer.append(item);
                            }
                        }
                    }
                    app.bindFilesAndFolders();
                }

            } else {
                app.alert('You are not logged in. Please login to continue.', app.loadScreen('login'), 'Login Required', 'OK');
            }
        });
    },

    bindUploadFilesButton: function() {
        $('#upload-files').click(function() {
            if (app.images.length <= 0) {
                return false;
            }
            app.uploadFiles();
        });
    },

    uploadFiles: function() {
        $.ajaxSetup({timeout:60000});

        app.loadScreen('uploading');

        var uploadUrl = app.apiUrl + 'expenses/upload?token=' + window.localStorage.getItem('token') + '&payment=' + app.payment;
        var items = app.images;
        var defs = [];
        var fd = new FormData();
        items.forEach(function(item) {
            var def = $.Deferred();
            window.resolveLocalFileSystemURL(item, function(fileEntry) {
                console.log('got a file entry');
                fileEntry.file(function(file) {
                    console.log('now i have a file ob');
                    //console.dir(file);
                    var reader = new FileReader();
                    reader.onloadend = function(e) {
                        var imgBlob = new Blob([this.result], { type:file.type});
                        fd.append(item, imgBlob, file.name);
                        def.resolve();
                    };
                    reader.readAsArrayBuffer(file);
                }, function(e) {
                    console.log('error getting file', e);
                });
            }, function(e) {
                console.log('Error resolving fs url', e);
            });

            defs.push(def.promise());
        });

        $.when.apply($, defs).then(function() {
            var request = new XMLHttpRequest();
            request.open('POST', uploadUrl, true);
            request.timeout = 60000;

            request.ontimeout = function(e) {
                app.alert('Your upload timed out. Try uploading on a Wifi connection, or upload less files at once.', null, 'Oops!', 'OK');

                $('#other-input').val('');
                app.images.length = 0;
                app.showIndex();
                app.menuActivate(0);
            };

            request.onerror = function() {
                app.alert('There was an error uploading your expenses. Please try again.', null, 'Oops!', 'OK');

                $('#other-input').val('');
                app.images.length = 0;
                app.showIndex();
                app.menuActivate(0);
            };

            request.onload = function(e) {
                if (request.readyState == 4 && request.status == 200) {
                    console.log("all things done");
                    $('#other-input').val('');
                    app.alert('Your files have been uploaded.', null, 'Woo!', 'OK');
                    app.images.length = 0;
                    app.showIndex();
                    app.menuActivate(0);
                } else {
                    app.alert('There was an error uploading your expenses. Please try again.', null, 'Oops!', 'OK');

                    $('#other-input').val('');
                    app.images.length = 0;
                    app.showIndex();
                    app.menuActivate(0);
                }
            };

            request.send(fd);
        });
    },

    bindSubmitPaymentButton: function() {
        $('#submit-payment').click(function() {
            var payment = $('#payment-select').val().toString();
            if (payment == 'Other') {
                payment = $('#other-input').val().toString();
            }
            app.payment = payment;
            if (app.uploadType == 'expense' && !payment) {
                app.alert('Please enter a valid payment method.', null, 'Error', 'OK');
                return false;
            }
            if (app.uploadType == 'document') {
                app.payment = 'N/A';
            }
            app.loadScreen('upload-submission');
        });
    },

    camSuccess: function(imageData) {
        app.images.push(imageData);
        var text = ' FILE ADDED';
        if (app.images.length > 1) {
            text = ' FILES ADDED';
        }
        $('#upload-status').html(parseInt(app.images.length) + text);
        if (app.images.length > 1) {
            app.loadScreen('upload-submission');
            return;
        }
        app.loadScreen('upload-type');
    },

    camError: function(error) {
    },

    accessCamera: function() {
        navigator.camera.getPicture(app.camSuccess, app.camError, {
            quality: 20,
            allowEdit: false,
            destinationType: navigator.camera.DestinationType.FILE_URI,
            encodingType: navigator.camera.EncodingType.JPEG,
            sourceType: navigator.camera.PictureSourceType.CAMERA,
            correctOrientation: true
        });
    },
};
