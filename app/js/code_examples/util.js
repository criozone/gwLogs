util = function() {
    var shopBillId='',encSh='',countOtpKsm=5,
        MD='',gpd,pml,ganalytics='',formIdCardNumber = '',ksmrequestallow=false,atoken='',checkLoggedAutopayment = 'N',sendEmailProcess=false, payType='', initPayment='',verificationCount=0,submitAction = false,autopay='',
        i = function (ganalytics,pml,autopay) {
            this.emailSuccessObserver();
            this.cardHolderNameObserver();
            this.ganalytics = ganalytics;
            this.pml=pml;
            this.autopay = autopay;
        },
        filterMask = function (val, mask) {
            switch (mask) {
                case "type:card":
                    return this.unmasked(val, 'space');
                case "type:longphone":
                    return this.unmasked(val, 'phone');
                default:
                    return val;
            }
        },
        cardHolderNameObserver = function () {
            if ($('#cardForm #card-pay__user-name').length) {
                $('#cardForm #card-pay__user-name').on('keypress', function (e) {
                    var key = String.fromCharCode(e.which);
                    var englishAlphabetAndWhiteSpace = /[A-Za-z _-]/g;
                    if (event.keyCode == 37 || event.keyCode == 39 || englishAlphabetAndWhiteSpace.test(key)) {
                        if ($('#cardForm #card-pay__user-name').val() != '0') {
                            $(this).parent().removeClass('pg-has-error');
                        } else {
                            $(this).parent().addClass('pg-has-error');
                        }
                        return true;
                    }
                    return false;
                });
            }
            if ($('#accountForm #card-pay__user-name').length) {
                $('#accountForm #card-pay__user-name').on('keypress', function (e) {
                    var key = String.fromCharCode(e.which);
                    var englishAlphabetAndWhiteSpace = /[A-Za-z _-]/g;
                    if (event.keyCode == 37 || event.keyCode == 39 || englishAlphabetAndWhiteSpace.test(key)) {
                        if ($('#accountForm #card-pay__user-name').val() != '0') {
                            $(this).parent().removeClass('pg-has-error');
                        } else {
                            $(this).parent().addClass('pg-has-error');
                        }
                        return true;
                    }
                    return false;
                });
            }
            if ($('#cardForm #card-pay__user-name').length) {
                $('#cardForm #card-pay__user-name').on('paste', function (e) {
                    var key = String.fromCharCode(e.which),pastedData = e.originalEvent.clipboardData.getData('text');
                    var regex = new RegExp("^[a-zA-Z ]*$");
                    if (regex.test(pastedData)) {
                        return true;
                    } else {
                        return false;
                    }
                });
            }
            if ($('#accountForm #card-pay__user-name').length) {
                $('#accountForm #card-pay__user-name').on('paste', function (e) {
                    var key = String.fromCharCode(e.which),pastedData = e.originalEvent.clipboardData.getData('text');
                    var regex = new RegExp("^[a-zA-Z ]*$");
                    if (regex.test(pastedData)) {
                        return true;
                    } else {
                        return false;
                    }
                });
            }
        },
        sl = function (event,error) {
            if ($('#isNeedWriteToLogByPayee').length && $('#isNeedWriteToLogByPayee').val() == 'Y') {
                try {
                    this.pml.sendevent(event,error);
                } catch (e) {
                    console.error(e);
                }
            }
        },
        nc = function (cardNumber, mask) {
            var res = cardNumber.replace(/\D/g, '');
            if (mask) {
                res = res.substr(0,6) + "******" + res.substr(12,15);
            }
            return res;
        },
        emailSuccessObserver = function () {
            var self = this;
            $('#success__user-email').on('input', function () {
                if (self.validateUserEmail($(this).val())) {
                    $(this).parent().removeClass('pg-has-error');
                    $(this).parent().find('.pg-input-error').text('');
                }
            });
            $('#success__user-email').on('focusout', function () {
                $(this).parent().removeClass('pg-has-error');
                $(this).parent().find('.pg-input-error').text('');
            });
        },
        un = function (val, mask) {
            var rule;
            switch (mask) {
                case 'space':
                    rule = /[\s _ ]/g;
                    break;
                case 'phone':
                    rule = /[() - _]/g;
                    break;
            }
            return val.replace(rule, '').replace(/-/g, '').replace(/_/g, '').replace(/\+/g, '').replace(/ /g, '');
        },
        gct = function (cardNumber) {
            var cardType,
                cardTypes = [{
                    name: 'visa',
                    pattern: /^4/,
                    valid_length: [16]
                }, {
                    name: 'mastercard',
                    pattern: /^[2, 5, 6]/,
                    valid_length: [16]
                }, {
                    name: 'nsmep',
                    pattern: /^9/,
                    valid_length: [16]
                }],
                normalize = function(number) {
                    return number.replace(/[ ]/g, '');
                },
                getCardType = function(cardNumber) {
                    var cardType;
                    for (var j = 0, len = cardTypes.length; j < len; j++) {
                        cardType = cardTypes[j];
                        if (cardNumber.match(cardType.pattern)) {
                            return cardType;
                        }
                    }
                    return null;
                };
            return getCardType(cardNumber);
        },
        ccs = function (cardNumber) {
            var self = this;
            if (cardNumber == '') {
                $('#'+self.formIdCardNumber).find('.pg-icon__mastercard-logo').addClass('hide');
                $('#'+self.formIdCardNumber).find('.pg-icon__visa-logo').addClass('hide');
                return;
            }
            var cardType,
                cardTypes = [{
                    name: 'visa',
                    pattern: /^4/,
                    valid_length: [16]
                }, {
                    name: 'mastercard',
                    pattern: /^[2, 5, 6]/,
                    valid_length: [16]
                }, {
                    name: 'nsmep',
                    pattern: /^9/,
                    valid_length: [16]
                }],
                normalize = function(number) {
                    return number.replace(/[ ]/g, '');
                },
                getCardType = function(cardNumber) {
                    var cardType;
                    for (var j = 0, len = cardTypes.length; j < len; j++) {
                        cardType = cardTypes[j];
                        if (cardNumber.match(cardType.pattern)) {
                            return cardType;
                        }
                    }
                    return null;
                };

            cardNumber = normalize(cardNumber);
            if (!cardNumber.length) return;
            cardType = getCardType(cardNumber);
            if (cardType !== null) {
                if (cardType.name == 'mastercard') {
                    $('#'+self.formIdCardNumber).find('.pg-icon__visa-logo').addClass('hide');
                    $('#'+self.formIdCardNumber).find('.pg-icon__mastercard-logo').removeClass('hide');
                } else if (cardType.name == 'visa') {
                    $('#'+self.formIdCardNumber).find('.pg-icon__mastercard-logo').addClass('hide');
                    $('#'+self.formIdCardNumber).find('.pg-icon__visa-logo').removeClass('hide');
                } else {
                    $('#'+self.formIdCardNumber).find('.pg-icon__mastercard-logo').addClass('hide');
                    $('#'+self.formIdCardNumber).find('.pg-icon__visa-logo').addClass('hide');
                }
            } else {
                $('#'+self.formIdCardNumber).find('.pg-icon__mastercard-logo').addClass('hide');
                $('#'+self.formIdCardNumber).find('.pg-icon__visa-logo').addClass('hide');
            }
        },
        cc = function(cardNumber) {
            if (/[^0-9 \-]+/.test(cardNumber)) {
                return false;
            }
            var cardNumber = this.processCardNumber(cardNumber);
            if (cardNumber.length !== 16) {
                return false;
            }

            var nCheck = 0, nDigit = 0,
                bEven = false, n, cDigit;

            for (n = cardNumber.length - 1; n >= 0; n--) {
                cDigit = cardNumber.charAt(n);
                nDigit = parseInt(cDigit, 10);
                if (bEven) {
                    if ((nDigit *= 2) > 9) {
                        nDigit -= 9;
                    }
                }
                nCheck += nDigit;
                bEven = !bEven;
            }
            return (nCheck % 10) === 0;
        },
        mc = function(cardId, func) {
            if (typeof func == 'undefined') {
                $('#'+cardId).inputmask('9999 9999 9999 9999', {
                    greedy : false,
                    placeholder : '_',
                    clearMaskOnLostFocus : true,
                    showMaskOnHover: false,
                    showMaskOnFocus:false
                });
            } else if (typeof func == 'function') {
                func(cardId);
            }
        },
        med = function (expDateId) {
            if (typeof func == 'undefined') {
                $('#'+expDateId).inputmask('99/99', {
                    greedy : false,
                    placeholder : '_',
                    clearMaskOnLostFocus : true,
                    showMaskOnHover: false,
                    showMaskOnFocus:false
                });
            } else if (typeof func == 'function') {
                func(expDateId);
            }
        },
        b = function(state, func) {
            var self = this;
            try {
                if (typeof func == 'undefined') {
                    var preloader = $('.modal-backdrop-preloader-ptm');
                    if (state == false) {
                        preloader.removeClass('in').css('z-index', 0).hide();
                        self.submitAction = false;
                    } else if (state == true) {
                        preloader.addClass('in').css('z-index', 1040).show();
                        self.submitAction = true;
                    }
                } else if (typeof func == 'function') {
                    func(state);
                }
            } catch (e) {
                console.log(e);
            }
        },
        sa = function (url, object, success, error, complete) {
            var self = this;
            return $.ajax({
                type     : 'POST',
                url      : url,
                data     : object,
                dataType : 'json',
                timeout: 0,
                success : function(obj) {
                    window.scrollTo(0,0);
                    if ($.isFunction(success)) {
                        success(obj);
                    }
                    return false;
                },
                error : function(obj) {
                    window.scrollTo(0,0);
                    if ($.isFunction(error)) {
                        error(obj);
                    } else {
                        $('#paymentBlock').addClass('hide');
                        $('#pg-verification__flow').addClass('hide');
                        $('#pg-ks-verification__flow').addClass('hide');
                        $('#pg-error__flow_signup').addClass('hide');
                        $('#pg-error__flow_remember_password').addClass('hide');
                        $('#pg-error__flow_unknownstatus').removeClass('hide');
                        self.setBusy(false);
                    }
                    return false;
                },
                complete : function(obj) {
                    $.each($('form', $('body')), function () {
                        var el = $(this);
                        $(this).data('submitted', false);
                    });
                }
            });
        },
        createFormSuccessRedirectWix = function(response) {
            window.location.href = response.successUrl;
            return false;
        },
        createFormFailureRedirectWix = function(response) {
            window.location.href = response.failureUrl;
            return false;
        },
        createFormSuccessRedirect = function (response) {
            var self = this;
            if ($('#clientNotificationType').length) {
                if ($('#clientNotificationType').val() == 'viberbot') {
                    var link = response.successUrl;
                    if (response.chatURI && response.chatURI != '')
                    {
                        var chatURI = '<input type="hidden" name="chatURI" value="'+response.chatURI+'" id="chatURI" />';
                    }
                    return $('<form enctype="application/x-www-form-urlencoded" action="' + link + '" id="success-form" class="hide" method="GET">'
                        + chatURI
                        + '<input type="hidden" name="context" value="' + response.specificData + '" id="context" />'
                        + '</form>');
                } else if ($('#clientNotificationType').val() == 'window.close') {
                    window.opener.PG.result(response);
                    return false;
                } else if ($('#clientNotificationType').val() == 'postMessage') {
                    var obj = {};
                    obj.response = response;
                    obj.method = 'success';
                    try {
                        window.opener.postMessage(obj, "*");
                    } catch (e) {
                        console.log(e);
                    }
                    return false;
                }
                else if ($('#clientNotificationType').val() == 'postMessageFrame') {
                    var obj = {};
                    obj.response = response;
                    obj.method = 'success';
                    try {
                        window.parent.postMessage(obj, "*");
                    } catch (e) {
                        console.log(e);
                    }
                    return false;
                } else if($('#clientNotificationType').val() == 'postMessageFrameNoClose') {
                    var obj = {};
                    obj.response = response;
                    obj.method = 'successnoclose';
                    try {
                        window.parent.postMessage(obj, "*");
                    } catch (e) {
                        console.log(e);
                    }
                    self.ganalytics.handle(response);
                    self.sl('paymentcardresult/?form=invoice','SUCCESS, NO SUCCESS URL');
                    self.shopBillId = response.shopBillId;
                    $('#pg-success__flow #success_shopordernumber').text(response.billNumber);
                    $('#pg-success__flow #success_billamount').text(response.billAmount);
                    $('#pg-success__flow #linkreceipt').attr('href', response.receiptLink);
                    $('#paymentBlock').addClass('hide');
                    $('#pg-success__flow').removeClass('hide');
                    self.setBusy(false);
                    return false;
                } else if ($('#clientNotificationType').val() == 'GET') {
                    window.location.href = response.successUrl;
                    return false;
                } else if ($('#clientNotificationType').val() == 'GET-PARAMS') {
                    return $('<form enctype="application/x-www-form-urlencoded" action="' + response.successUrl + '" id="success-form" class="hide" method="GET">'
                        + '<input type="hidden" name="SHOPBILLID" value="' + response.shopBillId + '" id="shopBillId" />'
                        + '<input type="hidden" name="SHOPORDERNUMBER" value="' + response.billNumber + '" id="shopOrderNumber" />'
                        + '<input type="hidden" name="APPROVALCODE" value="' + response.authCode + '" id="authCode" />'
                        + '<input type="hidden" name="BILL_AMOUNT" value="' + response.billAmount + '" id="billAmount" />'
                        + '<input type="hidden" name="TOKEN" value="' + response.token + '" id="token" />'
                        + '<input type="hidden" name="RESULT" value="0" id="result" />'
                        + '<input type="hidden" name="CARD_MASK" value="' + response.cardMask + '" id="card_mask" />'
                        + '<input type="hidden" name="ATTRIBUTE1" value="' + response.attribute1 + '" id="attribute1" />'
                        + '<input type="hidden" name="ATTRIBUTE2" value="' + response.attribute2 + '" id="attribute2" />'
                        + '<input type="hidden" name="ATTRIBUTE3" value="' + response.attribute3 + '" id="attribute3" />'
                        + '<input type="hidden" name="ATTRIBUTE4" value="' + response.attribute4 + '" id="attribute4" />'
                        + '<input type="hidden" name="RECEIPT_URL" value="' + response.receiptLink + '" id="receiptLink" />'
                        + '<input type="hidden" name="LANG" value="' + response.lang + '" id="lang" />'
                        + '<input type="hidden" name="DESCRIPTION" value="' + response.description + '" id="description" />'
                        + '<input type="hidden" name="IPSTOKEN" value="' + response.IPSTokenValue + '" id="IPSTokenValue" />'
                        + '<input type="hidden" name="ERRORIPSCODE" value="' + response.errorIPScode + '" id="errorIPScode" />'
                        + '<input type="hidden" name="ERRORIPSMESSAGE" value="' + response.errorIPSmessage + '" id="errorIPSmessage" />'
                        + '</form>');
                }
                else {
                    return $('<form enctype="application/x-www-form-urlencoded" action="' + response.successUrl + '" id="success-form" class="hide" method="POST">'
                        + '<input type="hidden" name="SHOPBILLID" value="' + response.shopBillId + '" id="shopBillId" />'
                        + '<input type="hidden" name="SHOPORDERNUMBER" value="' + response.billNumber + '" id="shopOrderNumber" />'
                        + '<input type="hidden" name="APPROVALCODE" value="' + response.authCode + '" id="authCode" />'
                        + '<input type="hidden" name="BILL_AMOUNT" value="' + response.billAmount + '" id="billAmount" />'
                        + '<input type="hidden" name="TOKEN" value="' + response.token + '" id="token" />'
                        + '<input type="hidden" name="RESULT" value="0" id="result" />'
                        + '<input type="hidden" name="CARD_MASK" value="' + response.cardMask + '" id="card_mask" />'
                        + '<input type="hidden" name="ATTRIBUTE1" value="' + response.attribute1 + '" id="attribute1" />'
                        + '<input type="hidden" name="ATTRIBUTE2" value="' + response.attribute2 + '" id="attribute2" />'
                        + '<input type="hidden" name="ATTRIBUTE3" value="' + response.attribute3 + '" id="attribute3" />'
                        + '<input type="hidden" name="ATTRIBUTE4" value="' + response.attribute4 + '" id="attribute4" />'
                        + '<input type="hidden" name="RECEIPT_URL" value="' + response.receiptLink + '" id="receiptLink" />'
                        + '<input type="hidden" name="LANG" value="' + response.lang + '" id="lang" />'
                        + '<input type="hidden" name="DESCRIPTION" value="' + response.description + '" id="description" />'
                        + '<input type="hidden" name="IPSTOKEN" value="' + response.IPSTokenValue + '" id="IPSTokenValue" />'
                        + '<input type="hidden" name="ERRORIPSCODE" value="' + response.errorIPScode + '" id="errorIPScode" />'
                        + '<input type="hidden" name="ERRORIPSMESSAGE" value="' + response.errorIPSmessage + '" id="errorIPSmessage" />'
                        + '</form>');
                }
            } else {
                return $('<form enctype="application/x-www-form-urlencoded" action="' + response.successUrl + '" id="success-form" class="hide" method="POST">'
                    + '<input type="hidden" name="SHOPBILLID" value="' + response.shopBillId + '" id="shopBillId" />'
                    + '<input type="hidden" name="SHOPORDERNUMBER" value="' + response.billNumber + '" id="shopOrderNumber" />'
                    + '<input type="hidden" name="APPROVALCODE" value="' + response.authCode + '" id="authCode" />'
                    + '<input type="hidden" name="BILL_AMOUNT" value="' + response.billAmount + '" id="billAmount" />'
                    + '<input type="hidden" name="TOKEN" value="' + response.token + '" id="token" />'
                    + '<input type="hidden" name="RESULT" value="0" id="result" />'
                    + '<input type="hidden" name="CARD_MASK" value="' + response.cardMask + '" id="card_mask" />'
                    + '<input type="hidden" name="ATTRIBUTE1" value="' + response.attribute1 + '" id="attribute1" />'
                    + '<input type="hidden" name="ATTRIBUTE2" value="' + response.attribute2 + '" id="attribute2" />'
                    + '<input type="hidden" name="ATTRIBUTE3" value="' + response.attribute3 + '" id="attribute3" />'
                    + '<input type="hidden" name="ATTRIBUTE4" value="' + response.attribute4 + '" id="attribute4" />'
                    + '<input type="hidden" name="RECEIPT_URL" value="' + response.receiptLink + '" id="receiptLink" />'
                    + '<input type="hidden" name="LANG" value="' + response.lang + '" id="lang" />'
                    + '<input type="hidden" name="DESCRIPTION" value="' + response.description + '" id="description" />'
                    + '<input type="hidden" name="IPSTOKEN" value="' + response.IPSTokenValue + '" id="IPSTokenValue" />'
                    + '<input type="hidden" name="ERRORIPSCODE" value="' + response.errorIPScode + '" id="errorIPScode" />'
                    + '<input type="hidden" name="ERRORIPSMESSAGE" value="' + response.errorIPSmessage + '" id="errorIPSmessage" />'
                    + '</form>');
            }
        },
        cmf = function(response) {
            return $('<form enctype="application/x-www-form-urlencoded" action="' + response.actionMPI + '" id="mpi-redirect-form" class="hide" method="POST">'
                + '<input type="hidden" name="TermUrl" value="' + response.termUrl + '" id="term-url" />'
                + '<input type="hidden" name="MD" value="' + response.md + '" id="md" />'
                + '<input type="hidden" name="PaReq" value="' + response.pareq + '" id="pa-req" />'
                + '</form>');
        },
        isValidEmail = function(emailAddress) {
            var pattern = new RegExp(/^((\"[\w-\s]+\")|([\w-]+(?:\.[\w-]+)*)|(\"[\w-\s]+\")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
            return pattern.test(emailAddress);
        },
        validateUserEmail = function (email) {
            return this.isValidEmail(email);
        },
        checkEmailPasswordBeforeSend = function () {
            var errorObj = {}, emailAddress = $('#portmone-pay__forgot-pass-email').val();
            if (!this.validateUserEmail(emailAddress)) {
                errorObj.email = {'error':messages.emailAlertWrong, 'id':'#portmone-pay__forgot-pass-email'};
            }
            if ($('#portmone-pay__forgot-pass-login').val().length < '6') {
                errorObj.login = {'error':messages.wrongLogin, 'id':'#portmone-pay__forgot-pass-login'};
            }
            if (this.sizeObject(errorObj) == 0) {
                errorObj.status = 'success';
            } else if (this.sizeObject(errorObj) > 0) {
                errorObj.status = 'error';
            }
            return errorObj;
        },
        checkEmailBeforeSend = function () {
            var errorObj = {}, emailAddress = $('#success__user-email').val();
            if (!this.validateUserEmail(emailAddress)) {
                errorObj.email = {'error':messages.emailAlertWrong, 'id':'#success__user-email'};
            }
            if (this.sizeObject(errorObj) == 0) {
                errorObj.status = 'success';
            } else if (this.sizeObject(errorObj) > 0) {
                errorObj.status = 'error';
            }
            return errorObj;
        },
        sendEmailAfterPayment = function () {
            var dataObj = {}, self = this;
            dataObj.format = 'json';
            dataObj.typeResponse = 'jsonemail';
            dataObj.emailType = 'default';
            dataObj.emailAddress = $('#success__user-email').val();
            dataObj.shopBillId = this.shopBillId;
            dataObj.rid = $('#rid').val();
            $('#success__user-email').parent().removeClass('pg-has-error');
            $('#success__user-email').parent().find('.pg-input-error').text('');
            this.setBusy(true);
            this.send(
                '/r3/secure/pay/sendemail/',
                dataObj,
                function (obj) {
                    if (obj.response.status == 'success') {
                        $('#pg-success__flow__email-box-id').removeClass('pg-open');
                        $('span#emailRecepientSuccess').text(dataObj.emailAddress);
                        $('#pg-success-recipient-message').css({'display':'block'});
                    } else if (obj.response.status == 'error') {
                        $('#success__user-email').parent().addClass('pg-has-error');
                        $('#success__user-email').parent().find('.pg-input-error').text(obj.response.error);
                    }
                    self.setBusy(false);
                },
                function () {
                    $('#pg-success__flow').addClass('hide');
                    $('#pg-error__flow_emailsend').removeClass('hide');
                    self.setBusy(false);
                }
            );
        },
        emailSuccessValidateInput = function () {
            var self = this;
            $('#success__user-email').on('input', function () {
                if (!self.isValidEmail($(this).val())) {
                    $(this).parent().addClass('pg-has-error');
                    $('.pg-input-error').text(messages.emailAlertWrong);
                } else {
                    $(this).parent().removeClass('pg-has-error');
                    $('.pg-input-error').text('');
                }
            });
        },
        checkUserEmail = function () {
            var self = this;
            $('#card-pay__user-email').on('input', function () {
                if (!self.isValidEmail($(this).val())) {
                    $(this).parent().addClass('pg-has-error');
                    $('.pg-input-error').text(messages.emailAlertWrong);
                } else {
                    $(this).parent().removeClass('pg-has-error');
                    $('.pg-input-error').text('');
                }
            });
        },
        oic = function (cardId, nextId) {
            var self = this;
            $('#'+cardId).on('input', function () {
                self.checkCardSystem(self.unmasked($(this).val()));
                if (self.unmasked($(this).val()).length == '16' && self.cardCheck(self.unmasked($(this).val())) == true) {
                    $('#'+nextId).focus();
                    $(this).parent().removeClass('pg-has-error');
                    $(this).parent().find('.pg-input-error').text('');
                } else if (self.unmasked($(this).val()).length == '16' && self.cardCheck(self.unmasked($(this).val())) == false) {
                    $(this).addClass('pg-has-error');
                    $(this).parent().find('.pg-input-error').text(messages.cardNumberError);
                } else if (self.unmasked($(this).val()).length == '0') {
                    $(this).parent().removeClass('pg-has-error');
                    $(this).parent().find('.pg-input-error').text('');
                }
            });
        },
        onInputCvv = function (cvvId, nextId) {
            $('#'+cvvId).on('input', function () {
                if ($(this).val().length == '3') {
                    $('#'+nextId).focus();
                }
            });
        },
        os = function (obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        },
        oied = function (expDateId, nextId) {
            var self = this;
            $('#'+expDateId).on('input', function () {
                if (self.unmasked($(this).val()).length == '5') {
                    $('#'+nextId).focus();
                }
            });
        },
        getFormReturn = function(url, shopOrderNumber, error) {
            if ($('#clientNotificationType').length) {
                if ($('#clientNotificationType').val() == 'viberbot') {
                    var link = url;
                    if ($('#chatURI').length && $('#chatURI').val() != '')
                    {
                        var chatURI = '<input type="hidden" name="chatURI" value="'+$('#chatURI').val()+'" id="chatURI" />';
                    }
                    return $('<form enctype="application/x-www-form-urlencoded" action="' + link + '" id="success-form" class="hide" method="GET">'
                        + chatURI
                        + '<input type="hidden" name="context" value="' + $('#failureContext').val() + '" id="context" />'
                        + '</form>');
                } else {
                    return $('<form enctype="application/x-www-form-urlencoded" action="' + url + '" id="form-return" class="hide" method="POST">'
                        + '<input type="hidden" name="SHOPORDERNUMBER" value="' + shopOrderNumber + '" id="" />'
                        + '<input type="hidden" name="RESULT" value="' + error + '" id="" />'
                        + '</form>');
                }
            } else {
                return $('<form enctype="application/x-www-form-urlencoded" action="' + url + '" id="form-return" class="hide" method="POST">'
                    + '<input type="hidden" name="SHOPORDERNUMBER" value="' + shopOrderNumber + '" id="" />'
                    + '<input type="hidden" name="RESULT" value="' + error + '" id="" />'
                    + '</form>');
            }
        },
        verificationksm = function() {
            var dataObj = {}, self = this;
            if (self.ksmrequestallow == false) {
                return;
            }
            $.each($('input, select, checkbox', $('#paymentBlock')).not('[type=button], .noteach'), function () {
                var el = $(this), name = el.attr('name');
                if (name) {
                    dataObj[name] = el.val();
                }
            });
            dataObj.shopBillId = self.shopBillId;
            dataObj.PaRes = $('#vcode-input-ks').val();
            dataObj.MD = self.MD;
            dataObj.payType = self.payType;
            delete (dataObj.emailAddress);
            dataObj.format = 'json';
            dataObj.typeResponse = 'json';
            self.setBusy(true);
            self.send(
                '/r3/secure/pay/payment',
                dataObj,
                function (obj) {
                    $('#vcode-input-ks').val('');
                    if (obj.response.errorCode == '0' && obj.response.isNeed3DS == 'N' && obj.response.successUrl == '') {
                        self.shopBillId = obj.response.shopBillId;
                        self.ganalytics.handle(obj.response);
                        self.sl('verificationstatus/?status=','SUCCESS');
                        $('#pg-success__flow #success_shopordernumber').text(obj.response.billNumber);
                        $('#pg-success__flow #success_billamount').text(obj.response.billAmount);
                        $('#pg-success__flow #linkreceipt').attr('href', obj.response.receiptLink);
                        $('#pg-ks-verification__flow').addClass('hide');
                        $('#pg-success__flow').removeClass('hide');
                        self.setBusy(false);
                    } else if (obj.response.errorCode == '0' && obj.response.isNeed3DS == 'N' && obj.response.successUrl != '') {
                        self.ganalytics.handle(obj.response);
                        var form = self.createFormSuccessRedirect(obj.response);
                        self.sl('verificationstatus/?status=','SUCCESS CLIENT GOING TO SUCCESS URL');
                        form.appendTo('body');
                        form.submit();
                    } else if(obj.response.errorCode == '0' && obj.response.isNeed3DS == 'Y') {
                        self.countOtpKsm = self.countOtpKsm - 1;
                        if (self.countOtpKsm == 0) {
                            $('#failCount').removeClass('hide');
                            $('#verificationks').attr('disabled',true);
                            $('#verificationks').addClass('pg-button-disabled');
                            $('#vcode-input-ks').parent().addClass('pg-has-error');
                            $('#vcode-input-ks').parent().find('.pg-input-error').html(messages.ksmCountError);
                            $('#pg-ks-verification__flow #countError').text(self.countOtpKsm);
                            self.sl('verificationstatus/?status=',obj.response.error);
                            $('#vcode-input-ks').trigger('focusout');
                            $('#vcode-input-ks').parent().removeClass('pg-active');
                            self.ksmrequestallow = false;
                            self.countOtpKsm = 5;
                        } else {
                            $('#vcode-input-ks').parent().addClass('pg-has-error');
                            $('#vcode-input-ks').parent().find('.pg-input-error').html(messages.ksmCountError);
                            $('#pg-ks-verification__flow #countError').text(self.countOtpKsm);
                            $('#vcode-input-ks').trigger('focusout');
                            $('#vcode-input-ks').parent().removeClass('pg-active');
                            self.sl('verificationstatus/?status=',obj.response.error);
                        }
                        self.setBusy(false);
                    } else {
                        $('#pg-ks-verification__flow').addClass('hide');
                        $('#pg-error__flow').removeClass('hide');
                        self.setBusy(false);
                    }
                }
            );
        },
        disableAutofill = function() {
            var realFields = [];
            var realFieldsMapper = {};

            var realPasswordMapper = [];
            var tmpPasswordMapper = [];
            var passwordLenMapper = [];
            var realPasswordValue;
            var _helper = {};

            Array.prototype.insert = function (index, item) {
                this.splice(index, 0, item);
            };
            _helper.passwordListener = function(obj, settings) {
                var passObj = (settings.passwordField === '') ? '.disabledAutoFillPassword' : settings.passwordField;

                if (obj.find('[type=password]').length > 0) {
                    obj.find('[type=password]').attr('type', 'text').addClass('disabledAutoFillPassword');
                }

                obj.on('keyup', passObj, function () {

                    if (!this.id) {
                        this.id = Math.random().toString(36).substring(5);
                    }
                    if (!realPasswordMapper.hasOwnProperty(this.id)) {
                        realPasswordMapper[this.id] = [];
                    }

                    var realPassword = realPasswordMapper[this.id];

                    tmpPasswordMapper[this.id] = $(this).val();
                    var tmpPassword = tmpPasswordMapper[this.id];

                    passwordLenMapper[this.id] = tmpPassword.length;
                    var passwordLen = passwordLenMapper[this.id];
                    var currKeyupPos = this.selectionStart;

                    for (var i = 0; i < passwordLen; i++) {
                        if (tmpPassword[i] !== settings.hidingChar) {
                            realPassword[i] = tmpPassword[i];
                        }
                    }

                    if (passwordLen < realPassword.length) {
                        var diff = realPassword.length - passwordLen;

                        var key = event.keyCode || event.charCode;
                        if (key == 8 || key == 46) {
                            realPassword.splice(currKeyupPos, diff);
                        }
                        else {
                            realPassword.splice(currKeyupPos - 1, diff + 1);
                            realPassword.insert(currKeyupPos - 1, tmpPassword[currKeyupPos - 1]);
                        }
                    }

                    $(this).val(tmpPassword.replace(/./g, settings.hidingChar));

                    if (settings.debugMode) {
                        console.log('Current keyup position: ' + currKeyupPos);
                        console.log('Password length: ' + passwordLen);
                        console.log('Real password:');
                        console.log(realPassword);
                    }
                    realPasswordValue = realPassword;
                    settings.callbackInput(realPassword);
                });
            }
            _helper.formSubmitListener = function(obj, settings) {
                var btnObj = (settings.submitButton == '') ? '.disableAutoFillSubmit' : settings.submitButton;

                obj.on('click', btnObj, function(event) {
                    _helper.restoreInput(obj, settings);
                    if (settings.callback.call()) {
                        if (settings.debugMode) {
                            console.log(obj.serialize())
                        } else {
                            if (settings.html5FormValidate) {
                                $(btnObj).attr('type', 'submit').trigger('submit');
                                setTimeout(function() {
                                    $(btnObj).attr('type', 'button');
                                }, 1000);

                            } else {
                                obj.submit();
                            }
                        }
                    }
                });
            };
            _helper.randomizeInput = function(obj, settings) {
                obj.find('input').each(function(i) {
                    realFields[i] = $(this).attr('name');
                    if(realFieldsMapper[realFields[i]]) {
                        $(this).attr('name', realFieldsMapper[realFields[i]]);
                    } else {
                        var randomName = Math.random().toString(36).replace(/[^a-z]+/g, '');
                        $(this).attr('name', randomName);
                        realFieldsMapper[realFields[i]] = randomName;
                    }
                });
            };

            _helper.restoreInput = function(obj, settings) {
                if (settings.randomizeInputName) {
                    obj.find('input').each(function(i) {
                        $(this).attr('name', realFields[i]);
                    });
                }
                if (settings.textToPassword) {
                    obj.find(settings.passwordField).attr('type', 'password');
                }

                obj.find(settings.passwordField).each(function (i) {
                    $(this).val(realPasswordMapper[this.id].join(''));
                });


            };

            $.fn.disableAutoFill = function(options) {
                var settings = $.extend(
                    {},
                    $.fn.disableAutoFill.defaults,
                    options
                );

                this.attr('autocomplete', 'off');

                if (this.find('[type=submit]').length > 0) {
                    this.find('[type=submit]').addClass('disableAutoFillSubmit').attr('type', 'button');
                }

                if (settings.submitButton != '') {
                    this.find(settings.submitButton).addClass('disableAutoFillSubmit').attr('type', 'button');
                }

                if (settings.randomizeInputName) {
                    _helper.randomizeInput(this, settings);
                }
                _helper.passwordListener(this, settings);
                _helper.formSubmitListener(this, settings);

            };

            $.fn.disableAutoFill.getRealPasswordValue = function() {
                return realPasswordValue;
            };

            $.fn.disableAutoFill.defaults = {
                debugMode: false,
                textToPassword: true,
                randomizeInputName: true,
                passwordField: '',
                hidingChar: '●',
                html5FormValidate: false,
                submitButton: '',
                callback: function() {
                    return true;
                },
                callbackInput: function() {
                    return true;
                },
            };
        },
        v = function () {
            var dataObj = {}, self = this;
            $.each($('input, select, checkbox', $('#paymentBlock')).not('[type=button], .noteach'), function () {
                var el = $(this), name = el.attr('name');
                if (name) {
                    dataObj[name] = el.val();
                }
            });
            dataObj.accountId = $('#accountIdInputHidden').val();
            if (self.initPayment == 'card') {
                if ($('#single_portmone_pay_card').length) {
                    dataObj.cardNumber = self.unmasked($('#single_portmone_pay_card').val(), 'space');
                } else if ($('#single_portmone_pay_card_token').length) {
                    dataObj.cardNumber = self.unmasked($('#single_portmone_pay_card_token').val(), 'space');
                }
                if ($('#single_portmone_pay_exp_date').length) {
                    dataObj.expDate = $('#single_portmone_pay_exp_date').val();
                } else if ($('#single_portmone_pay_exp_date_token').length) {
                    dataObj.expDate = $('#single_portmone_pay_exp_date_token').val();
                }
                if ($('#single_portmone_pay_cvv2').length && $('#single_portmone_pay_cvv2').val() != "") {
                    dataObj.cvv2 = $.fn.disableAutoFill.getRealPasswordValue().join("");
                } else if ($('#single_portmone_pay_cvv2_token').length && $('#single_portmone_pay_cvv2_token').val() != "") {
                    dataObj.cvv2 = $.fn.disableAutoFill.getRealPasswordValue().join("");
                }
                self.sl('verificationsend/?form=card');
            } else if (self.initPayment == 'account') {
                dataObj.cvv2 = $.fn.disableAutoFill.getRealPasswordValue().join("");
                self.sl('verificationsend/?form=account');
            } else if (self.initPayment == 'accountaddcard') {
                dataObj.expDate = $.fn.disableAutoFill.getRealPasswordValue().join("");
                dataObj.cardNumber = self.unmasked($('#portmone-pay__card').val(), 'space');
                dataObj.cvv2 = $.fn.disableAutoFill.getRealPasswordValue().join("");
                self.sl('verificationsend/?form=accountaddcard');
            } else if (self.initPayment == 'token') {
                dataObj.cvv2 = $.fn.disableAutoFill.getRealPasswordValue().join("");
                self.sl('verificationsend/?form=token');
            }
            dataObj.shopBillId = self.shopBillId;
            dataObj.code = $('#vcode-input').val();
            dataObj.payType = self.payType;
            dataObj.shopBillId = self.shopBillId;
            delete (dataObj.emailAddress);
            dataObj.format = 'json';
            dataObj.typeResponse = 'json';
            if (self.gpd != '') {
                dataObj.paymentDataGpay = self.gpd;
            }
            if (self.atoken !='') {
                dataObj.appletoken = self.atoken;
            }
            self.setBusy(true);
            self.send(
                '/r3/secure/pay/verification',
                dataObj,
                function (obj) {
                    $('#vcode-input').val('');
                    if (obj.response.errorCode == '0' && obj.response.isNeed3DS == 'N' && obj.response.successUrl == '') {
                        self.shopBillId = obj.response.shopBillId;
                        self.ganalytics.handle(obj.response);
                        self.sl('verificationstatus/?status=','SUCCESS');
                        $('#pg-success__flow #success_shopordernumber').text(obj.response.billNumber);
                        $('#pg-success__flow #success_billamount').text(obj.response.billAmount);
                        $('#pg-success__flow #linkreceipt').attr('href', obj.response.receiptLink);
                        $('#pg-verification__flow').addClass('hide');
                        $('#pg-success__flow').removeClass('hide');
                        self.setBusy(false);
                    } else if (obj.response.errorCode == '0' && obj.response.isNeed3DS == 'N' && obj.response.successUrl != '') {
                        self.ganalytics.handle(obj.response);
                        var form = self.createFormSuccessRedirect(obj.response);
                        self.sl('verificationstatus/?status=','SUCCESS CLIENT GOING TO SUCCESS URL');
                        form.appendTo('body');
                        form.submit();
                    } else if(obj.response.errorCode == '101') {
                        self.verificationCount = self.verificationCount + 1;
                        if (self.verificationCount == 2) {
                            self.verificationCount = 0;
                            $('#pg-verification__flow').addClass('hide');
                            $('#pg-error__flow').removeClass('hide');
                            $('#pg-error__flow #pg-desc--error').text(obj.response.error);
                            self.sl('verificationstatus/?status=',obj.response.error);
                        } else {
                            $('#vcode-input').parent().addClass('pg-has-error');
                            $('#vcode-input').parent().find('.pg-input-error').text(obj.response.error);
                            self.sl('verificationstatus/?status=',obj.response.error);
                        }
                        self.setBusy(false);
                    } else if (obj.response.errorCode != '0' && obj.response.errorCode != '101') {
                        $('#pg-verification__flow').addClass('hide');
                        $('#pg-error__flow').removeClass('hide');
                        $('#pg-error__flow #pg-desc--error').text(obj.response.error);
                        self.sl('verificationstatus/?status=',obj.response.error);
                        self.setBusy(false);
                    }
                }
            );
        };
    return {
        init: i,
        setCardMask : mc,
        setExpDateMask : med,
        setBusy: b,
        cardCheck: cc,
        processCardNumber:nc,
        send : sa,
        unmasked: un,
        createMpiForm: cmf,
        createFormSuccessRedirect:createFormSuccessRedirect,
        verification:v,
        verificationksm:verificationksm,
        sizeObject:os,
        sl:sl,
        checkCardSystem: ccs,
        getCardSystem:gct,
        getFormReturn:getFormReturn,
        isValidEmail:isValidEmail,
        checkUserEmail:checkUserEmail,
        validateUserEmail:validateUserEmail,
        emailSuccessValidateInput:emailSuccessValidateInput,
        checkEmailBeforeSend:checkEmailBeforeSend,
        checkEmailPasswordBeforeSend:checkEmailPasswordBeforeSend,
        sendEmailAfterPayment:sendEmailAfterPayment,
        emailSuccessObserver:emailSuccessObserver,
        formIdCardNumber:formIdCardNumber,
        payType:payType,
        shopBillId:shopBillId,
        initPayment:initPayment,
        verificationCount:verificationCount,
        ganalytics:ganalytics,
        submitAction:submitAction,
        pml:pml,
        gpd:gpd,
        encSh:encSh,
        filterMask:filterMask,
        cardHolderNameObserver:cardHolderNameObserver,
        autopay:autopay,
        checkLoggedAutopayment:checkLoggedAutopayment,
        MD:MD,
        countOtpKsm:countOtpKsm,
        ksmrequestallow:ksmrequestallow,
        createFormSuccessRedirectWix:createFormSuccessRedirectWix,
        createFormFailureRedirectWix:createFormFailureRedirectWix,
        disableAutofill:disableAutofill
    };
};

define(['util'], function () {
    return new util();
});
