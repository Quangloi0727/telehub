1)  Tính năng :
+ Controllers : tạo file trong thư mục : /controllers/article
+ Modals : tạo file trong thư mục : /modals/article
+ Views : tạo file trong thư mục : /vews/layout/article

* Chú ý :  tên tệp tin phải giống nhau.
* Ví dụ : với tính năng quản lý và interface cho "users" thì tạo file lần lượt là :
    - Controllers : /controllers/users.js
    - Modals : /modals/users.js
    - Views :
        + index : /views/layout/users.ejs
        + new :  /views/layout/users-new.ejs
        + edit :  /views/layout/users-edit.ejs
        + detail : /views/layout/users-detail.ejs

    - tên tệp tin không bắt buộc qui tắc, có thể chủ động load views nào ở trong controllers

2) Qui tắc đặt tên : không bắt đầu bằng số, không có khoảng trắng, có thể dùng '-', sau khi tạo file mặc định sẽ có biến được tạo ra như sau:

* Ví dụ modals schema:
    - file name : users.js -> tên biến : _Users
    - file name : user-detail.js -> tên biến : _UserDetail
    - file name : User-detail || uSer-dEtaiL || user-DETAIL || ... -> tên biến : _UserDetail


* Ví dụ link interface:
    - file name : users.js -> url : http://domain.com/user
    - file name : user-detail.js -> url : http://domain.com/user-detail
    - file name : User-detail || uSer-dEtaiL || user-DETAIL || ... -> url : http://domain.com/user-detail


3) Front-end custom : Mỗi views sẽ có 1 thư mục tương ứng với tên file của views (.ejs) trong thư mục assets/pages/ bao gồm 2 file .css và .js,
 * Băt buộc phải đặt tên : style.css và script.js
 * Không bắt buộc phải có thư mục này, hoặc có thể để thư mục trống
 * Có thể tạo 1 trong 2 hoặc cả 2 tuỳ thuộc nhu cầu


 4) Plugins:
    validation : https://github.com/posabsolute/jQuery-Validation-Engine
    bootstrap : http://getbootstrap.com
    swal : http://t4t5.github.io/sweetalert/
    moment : http://momentjs.com/