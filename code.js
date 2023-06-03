// tạo ra form chung
// lấy được element form chung
// lấy được element của từng form
function validation(option) {
    var listrules = {}

    // lấy từng formelement từ DOM
    const formElement = document.querySelector(option.form)
    function getParent(ruleElement, selector) {
        while (ruleElement.parentElement) {
            if (ruleElement.parentElement.matches(selector)) {
                return ruleElement.parentElement;
            }
            ruleElement = ruleElement.parentElement
        }
    }
    // xử lí khi các form không được điền đúng
    function validate(ruleElement, rule) {
        // vì không phải lúc nào đoạn mã cũng làm theo một form, vì vậy ta phải làm riêng ra một hàm để get parent
        const getmsg = getParent(ruleElement, option.formGroup).querySelector(option.erroralert)
        var errormsg
        var ruls = listrules[rule.selector]


        // lọc qua các rule của một selector,
        // cái errormsg hoạt động trước thì thoát 
        // với lòng lặp này thì có thể sử dụng các rule khác nhau trong một selector
        for (var i = 0; i < ruls.length; i++) {
            // kiêm tra từng rule xong trong đó có cái nào thuộc loại ratio hoặc checkbox hay không
            switch (ruleElement.type) {
                case "checkbox":
                    errormsg = ruls[i](formElement.querySelector(
                        rule.selector + ':checked'
                    ))
                    break;
                case "radio":
                    errormsg = ruls[i](formElement.querySelector(
                        rule.selector + ':checked'
                    ))
                    break;
                default:
                    // trim() có tác dụng loại bỏ các khoảng trắng
                    errormsg = ruls[i](ruleElement.value.trim())
            }

            // var current = rule.test(ruleElement.value.trim())
            // vì sao đoạn errormsg này không lấy dạng .test thì xem lại đoạn phía dưới
            // khi mà mỗi phần tử ta đã lấy rule.test rồi
            if (errormsg) break
        }
        // khi có lỗi
        if (errormsg) {
            // errormsg đúng khi mà có dòng chữ 'Trường này chưa hợp lệ'
            getmsg.innerHTML = errormsg
            getParent(ruleElement, option.formGroup).classList.add('invalid')
        }
        // khi không có lỗi
        else {
            // ngược là là trường hợp undefined
            getmsg.innerHTML = ''
            getParent(ruleElement, option.formGroup).classList.remove('invalid')
        }
        // đưa về dạng boolean
        return !errormsg
    }
    // xoá thông báo lỗi khi gõ bất kì một kí tự xuống
    function autoclear(ruleElement, rule) {
        if (ruleElement) {
            const getmsg = getParent(ruleElement, option.formGroup).querySelector(option.erroralert)
            ruleElement.oninput = function () {
                const errormsg = rule.test(ruleElement.value.trim())
                getmsg.innerHTML = ''
                getParent(ruleElement, option.formGroup).classList.remove('invalid')
            }
        }
    }
    // hành động submit
    if (formElement) {
        formElement.onsubmit = function (e) {
            // ngăn chạn hành vi submit(sẽ xuất hiện trên console)
            e.preventDefault();
            var isFormValid = true;



            // lọc qua lại tất của các form và kiểm tra xem có bị lỗi không
            option.rules.forEach(function (rule) {
                // lấy từng rule của từng formelement
                const ruleElement = formElement.querySelector(rule.selector)
                // vì thao tác gửi nên coi như mọi cái add rule đã thực hiện xong
                // tới đoạn submit này ta dùng luôn validate thay vì blur 
                var validatecheck = validate(ruleElement, rule)
                // nếu có một validate nào có lỗi thì set giá trị isFormValid false
                if (!validatecheck) {
                    isFormValid = false
                }
            })
            // if (isFormValid) {
            //     console.log('Không có lỗi')
            // }
            // else {
            //     console.log('Có lỗi')
            // }
            if (isFormValid) {
                if (typeof option.onSubmit === 'function') {
                    // select tất cả các field là name
                    var enableInput = formElement.querySelectorAll('[name]')
                    // vì enableInput trả về nodelist nên phải chuyển sang Array để sử dụng reduce
                    var listsubmit = Array.from(enableInput).reduce(function (values, input) {
                        // nhưng đoạn mã bên dưới sẽ không in ra gì hết(giải thích ở video 200) nếu như ta nhập thiếu một trường
                        // return (values[input.name] = input.value) && values
                        // nên ta sử dụng đoạn mã sau

                        // kiểm tra kiểu của từng loại, chứ không sẽ bug ở phần lấy value của phần radio
                        switch (input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                // kiêm tra xem nếu chưa được check(tức là cái sẽ ko lấy giá trị sẽ trả về values như thông thường)
                                if (!input.matches(':checked')) return values
                                // nếu input ở kiểu checked thì gán cho nó thành một mảng
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }
                                    // đoạn này sẽ cập nhật cái input đó vào mảng vừa tạo
                                    values[input.name].push(input.value)
                                break;
                            case 'file':
                                values[input.name] = input.files
                                break;
                            default:
                                values[input.name] = input.value
                        }
                        return values
                        // với việc truyền object thì values sẽ nhận giá trị là object
                    }, {})
                    option.onSubmit(listsubmit)
                }
            }
        }
    }
    // lấy các element từ formelement, và lắng nghe các sự kiện blur, type
    option.rules.forEach(function (rule) {
        // nếu chỉ sử dụng dòng lệnh này để lưu dữ liệu thì nó sẽ chỉ lưu 
        // cái rule cuối cùng đối với từng selector, nên ta sử dụng dòng lênh ở dưới
        // listrules[rule.selector] = [rule.test]
        if (Array.isArray(listrules[rule.selector])) {
            // nếu mảng đã là mảng trước đó thì add thêm phần tử vào
            listrules[rule.selector].push(rule.test)
        }
        else {
            // tạo ra mảng trong object, nó sẽ lấy giá trị rule.test đầu tiên
            listrules[rule.selector] = [rule.test]
        }
        // lấy từ rule của từng formelement
        // nhưng vì phần giới ta có tận 3 input[name="gender"] giống nhau
        // nên ta cần phải lấy ra một list như vậy
        const ruleElements = formElement.querySelectorAll(rule.selector)
        Array.from(ruleElements).forEach(function (ruleElement) {
            // xuất hiện lỗi khi blur
            if (ruleElement) {
                ruleElement.onblur = function () {
                    validate(ruleElement, rule)
                }
            }
            // tự động xoá thông báo lỗi khi nhập một kí tự bất kì
            autoclear(ruleElement, rule)
        })
    }
    )
}
validation.isRequired = function (selector, message) {
    // selector là sẽ thấy các giá trị như #password, #email
    // đối số message được dùng để thông báo cho từng trường hợp 
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Trường này chưa hợp lệ'
        }
    }
},
    validation.isEmail = function (selector, message) {
        return {
            selector: selector,
            test: function (value) {
                var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
                return regex.test(value) ? undefined : message || 'Trường này chưa hợp lệ'
            }
        }
    }
validation.isMinLength = function (selector, valuerequired) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= valuerequired ? undefined : `Chiều dài tối thiểu là ${valuerequired}`
        }
    }
}
validation.isConfirm = function (selector, confirm, message) {
    return {
        selector: selector,
        test: function (value) {
            return value == confirm() ? undefined : message || 'Giá trị nhập không chính xác'
        }
    }
}