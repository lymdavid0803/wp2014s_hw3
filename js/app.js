(function () {
    Parse.initialize("JbX1DdzqHkHT1XoKEuHiWvODw9JTl7Q3UwZqcWua", "MbXaF1WX0AeAWflu05XS85M8Ea88TElP8PyspSun");
    //初始化
    var e = {};
    ["loginView", "evaluationView", "updateSuccessView"].forEach(function (t) {
        templateCode = document.getElementById(t).text;
        e[t] = doT.template(templateCode)
    });
    //載入版型
    var t = {
        loginRequiredView: function (e) {
            return function () {
                var t = Parse.User.current();
                if (t) {
                    e()
                } else {
                    window.location.hash = "login/" + window.location.hash
                }
            }
        }
    };
    //判斷是否為登入狀態
    var n = {
        navbar: function () {
            var e = Parse.User.current();
            //判斷有沒有登入
            if (e) {
                document.getElementById("loginButton").style.display = "none";
                document.getElementById("logoutButton").style.display = "block";
                document.getElementById("evaluationButton").style.display = "block"
            } else {
                document.getElementById("loginButton").style.display = "block";
                document.getElementById("logoutButton").style.display = "none";
                document.getElementById("evaluationButton").style.display = "none"
            }
            document.getElementById("logoutButton").addEventListener("click", function () {
                Parse.User.logOut();
                n.navbar();
                window.location.hash = "login/"
            })
        },
        evaluationView: t.loginRequiredView(function () {
            var t = Parse.Object.extend("Evaluation");
            var n = Parse.User.current();
            var r = new Parse.ACL;
            //權限
            r.setPublicReadAccess(false);
            r.setPublicWriteAccess(false);
            r.setReadAccess(n, true);
            r.setWriteAccess(n, true);
            var i = new Parse.Query(t);
            i.equalTo("user", n);
            //找到你的組員 評分
            i.first({
                success: function (i) {
                    window.EVAL = i;
                    if (i === undefined) {
                        var s = TAHelp.getMemberlistOf(n.get("username")).filter(function (e) {
                            return e.StudentId !== n.get("username") ? true : false
                            //判斷是不是自己
                        }).map(function (e) {
                            e.scores = ["0", "0", "0", "0"];
                            return e
                            //初始化分數
                        })
                    } else {
                        var s = i.toJSON().evaluations
                        //已經評過分
                    }
                    document.getElementById("content").innerHTML = e.evaluationView(s);
                    //印到網頁上
                    document.getElementById("evaluationForm-submit").value = i === undefined ? "送出表單" : "修改表單";
                    document.getElementById("evaluationForm").addEventListener("submit", function () {
                        for (var o = 0; o < s.length; o++) {
                            for (var u = 0; u < s[o].scores.length; u++) {
                                var a = document.getElementById("stu" + s[o].StudentId + "-q" + u);
                                //判斷哪個人哪一題的分數
                                var f = a.options[a.selectedIndex].value;
                                s[o].scores[u] = f
                            }
                        }
                        if (i === undefined) {
                            i = new t;
                            i.set("user", n);
                            i.setACL(r)
                        }
                        //確認表單是否全填
                        console.log(s);
                        i.set("evaluations", s);
                        i.save(null, {
                            success: function () {
                                document.getElementById("content").innerHTML = e.updateSuccessView()
                            },
                            error: function () {}
                        })
                    }, false)
                },
                error: function (e, t) {}
            })
        }),
        loginView: function (t) {
            var r = function (e) {
                    var t = document.getElementById(e).value;
                    return TAHelp.getMemberlistOf(t) === false ? false : true
                };
                //判斷是否為課程學生
            var i = function (e, t, n) {
                    if (!t()) {
                        document.getElementById(e).innerHTML = n;
                        document.getElementById(e).style.display = "block"
                    } else {
                        document.getElementById(e).style.display = "none"
                    }
                };
                //如果是錯的 印出錯誤訊息
            var s = function () {
                    n.navbar();
                    window.location.hash = t ? t : ""
                };
                //不懂
            var o = function () {
                    var e = document.getElementById("form-signup-password");
                    var t = document.getElementById("form-signup-password1");
                    var n = e.value === t.value ? true : false;
                    i("form-signup-message", function () {return n}, "Passwords don't match.");
                    return n
                };
                //兩次密碼一不一樣
            document.getElementById("content").innerHTML = e.loginView();
            //回到登入註冊頁
            document.getElementById("form-signin-student-id").addEventListener("keyup", function () {
                i("form-signin-message", function () {
                    return r("form-signin-student-id")
                }, "The student is not one of the class students.")
            });
            //登入判斷是否為這堂課的學生
            document.getElementById("form-signin").addEventListener("submit", function () {
                if (!r("form-signin-student-id")) {
                    alert("The student is not one of the class students.");
                    return false
                }
                //登入判斷是否為這堂課的學生(跳窗)
                Parse.User.logIn(document.getElementById("form-signin-student-id").value, document.getElementById("form-signin-password").value, {
                    success: function (e) {
                        s()
                    },
                    //繼續
                    error: function (e, t) {
                        i("form-signin-message", function () {
                            return false
                        }, "Invaild username or password.")
                    }
                    //帳密對不對
                })
            }, false);
            document.getElementById("form-signup-student-id").addEventListener("keyup", function () {
                i("form-signup-message", function () {
                    return r("form-signup-student-id")
                }, "The student is not one of the class students.")
            });
            //註冊帳號是不是這堂課的學生
            document.getElementById("form-signup-password1").addEventListener("keyup", o);
            //輸入第一次密碼
            document.getElementById("form-signup").addEventListener("submit", function () {
                if (!r("form-signup-student-id")) {
                    alert("The student is not one of the class students.");
                    return false
                }
                var e = o();
                if (!e) {
                    return false
                }
                //送出再判斷是否為學生
                var t = new Parse.User;
                t.set("username", document.getElementById("form-signup-student-id").value);
                t.set("password", document.getElementById("form-signup-password").value);
                t.set("email", document.getElementById("form-signup-email").value);
                //紀錄帳密信箱
                t.signUp(null, {
                    success: function (e) {
                        s()
                    },
                    error: function (e, t) {
                        i("form-signup-message", function () {
                            return false
                        }, t.message)
                    }
                })
                //可不可以送入資料庫
            }, false)
        }
    };
    var r = Parse.Router.extend({
        routes: {
            "": "indexView",
            "peer-evaluation/": "evaluationView",
            "login/*redirect": "loginView"
        },
        indexView: n.evaluationView,
        evaluationView: n.evaluationView,
        loginView: n.loginView
    });
    this.Router = new r;
    Parse.history.start();
    n.navbar()
})()