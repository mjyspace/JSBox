// By JunM。
// Please refer to Readme.md

// let app = require("scripts/app");
let piexif = require("scripts/piexif");
let utils = require("scripts/utils");
let html_template = $file.read("/assets/html/index.html").string;
let exifObj = null; // Store exif data of original photo.
let image_data = null;
let image_data_base64 = null;
let photo_date = null;

let deviceScreenHeight = $device.info["screen"]["height"];
let deviceScreenWidth = $device.info["screen"]["width"];

let input_element_height = deviceScreenHeight / 15 - 10;

let color_jsbox = $color("tint");

let rc_hex = ("00" + ((color_jsbox.runtimeValue().invoke("redComponent") * 255).toString(16))).split(".")[0].slice(-2,);
let gc_hex = ("00" + ((color_jsbox.runtimeValue().invoke("greenComponent") * 255).toString(16))).split(".")[0].slice(-2,);
let bc_hex = ("00" + ((color_jsbox.runtimeValue().invoke("blueComponent") * 255).toString(16))).split(".")[0].slice(-2,);
let color_hex = `#${rc_hex}${gc_hex}${bc_hex}`;
console.log(html_template);
console.log(color_hex);
html_template = html_template.replace(/background-color-to-be-replaced/, color_hex);
console.log(html_template);

let default_exifObj = {
    "Interop": {},
    "GPS": {
        "2": [
            [
                1,
                1
            ],
            [
                1,
                1
            ],
            [
                1111,
                100
            ]
        ],
        "3": "E",
        "16": "T",
        "4": [
            [
                1,
                1
            ],
            [
                1,
                1
            ],
            [
                1111,
                100
            ]
        ],
        "5": 0,
        "12": "K",
        "23": "T",
        "6": [
            1,
            1
        ],
        "17": [
            1,
            1
        ],
        "13": [
            0,
            1
        ],
        "7": [
            [
                1,
                1
            ],
            [
                1,
                1
            ],
            [
                1,
                100
            ]
        ],
        "24": [
            1,
            1
        ],
        "29": "1970:01:01",
        "1": "N",
        "31": [
            1,
            1
        ]
    },
    "0th": {
        "34853": 1,
        "271": "",
        "274": 0,
        "531": 1,
        "306": "1970:01:01 01:01:01",
        "283": [
            1,
            1
        ],
        "296": 2,
        "305": "12.0",
        "282": [
            72,
            1
        ],
        "272": "",
        "34665": 1
    },
    "Exif": {
        "41987": 0,
        "41985": 2,
        "37379": [
            1,
            1
        ],
        "37386": [
            1,
            1
        ],
        "37377": [
            1,
            1
        ],
        "41990": 0,
        "40962": 1,
        "37522": "",
        "40960": "0100",
        "36867": "1970:01:01 01:01:01",
        "37380": [
            0,
            1
        ],
        "42036": "",
        "41495": 1,
        "37500": "",
        "42034": [
            [
                1,
                1
            ],
            [
                1,
                1
            ],
            [
                1,
                1
            ],
            [
                1,
                1
            ]
        ],
        "37121": "",
        "34850": 1,
        "41986": 0,
        "33434": [
            1,
            2
        ],
        "41729": "",
        "37396": [
            2,
            1,
            2,
            1
        ],
        "37378": [
            1,
            1
        ],
        "40963": 1,
        "37385": 1,
        "37383": 0,
        "36868": "1970:01:01 01:01:01",
        "37521": "",
        "34855": 1,
        "40961": 65535,
        "42035": "",
        "36864": "",
        "33437": [
            9,
            5
        ],
        "41989": 1
    },
    "1st": {
        "296": 0,
        "259": 0,
        "513": 1,
        "282": [
            1,
            1
        ],
        "514": 1,
        "283": [
            1,
            1
        ]
    }
}


function input_element_top(index) {
    return 10 + (5 + input_element_height) * (index - 1)

}

$app.keyboardToolbarEnabled = true;

let latitude_choices = [
    {
        name: $l10n("N"),
        value: "N"
    },
    {
        name: $l10n("S"),
        value: "S"
    }
];

let longtitude_choices = [
    {
        name: $l10n("E"),
        value: "E"
    },
    {
        name: $l10n("W"),
        value: "W"
    }
];


function gps_decimal_to_sexagecimal(gps_decimal) {

    let gps_degree = parseInt(gps_decimal.toString());
    let gps_minute = parseInt(((gps_decimal - gps_degree) * 60).toString());
    let gps_second_100 = parseInt((((gps_decimal - gps_degree) * 60 * 60 - gps_minute * 60) * 100).toString());

    return [gps_degree, gps_minute, gps_second_100]
}


function gps_sexagecimal_to_decimal(gps_degree, gps_minute, gps_second_100) {
    return (gps_degree + (gps_minute / 60) + (gps_second_100 / 360000)).toFixed(4)
}

function show_tips() {
    if (($app.env !== $env.app) && ($app.env !== $env.action)) {
        utils.stopScript();
    } else if ($app.env === $env.action) {
        return new Promise(function (resolve, reject) {
            user_data = $cache.get("user_data");

            let tmp_value_first_launch_jsbox_app = null;
            try {
                tmp_value_first_launch_jsbox_app = user_data["first_launch_jsbox_app"];
            } catch (e) {
                tmp_value_first_launch_jsbox_app = true;
            }


            if ((user_data === undefined)
                || (user_data["first_launch_share_sheet"] === undefined)
                || ((user_data["first_launch_share_sheet"] === true))) {


                $ui.alert({
                    title: $l10n("Tips"),
                    message: $l10n("Due to iOS's memory management policy, " +
                        "running this script in the share menu may crash; " +
                        "if a crash occurs, please run this script in the JSBox app."),
                    actions: [
                        {
                            title: $l10n("OK"),
                            handler: function () {

                                $cache.set("user_data", {
                                    "first_launch_jsbox_app": tmp_value_first_launch_jsbox_app,
                                    "first_launch_share_sheet": false
                                });


                                resolve("Whatever");
                            }
                        },
                    ]
                });


            } else {
                resolve("Whatever");
            }
        });

    } else if ($app.env === $env.app) {
        return new Promise(function (resolve, reject) {
            user_data = $cache.get("user_data");
            let tmp_value_first_launch_share_sheet = null;
            try {
                tmp_value_first_launch_share_sheet = user_data["first_launch_share_sheet"];
            } catch (e) {
                tmp_value_first_launch_share_sheet = true;
            }

            if ((user_data === undefined)
                || (user_data["first_launch_jsbox_app"] === undefined)
                || ((user_data["first_launch_jsbox_app"] === true))) {


                $ui.alert({
                    title: $l10n("Tips"),
                    message: $l10n("This script uses piexifjs " +
                        "library to modify exif of photos and does not support HEIF, PNG."),
                    actions: [
                        {
                            title: $l10n("OK"),
                            handler: function () {

                                $cache.set("user_data", {
                                    "first_launch_jsbox_app": false,
                                    "first_launch_share_sheet": tmp_value_first_launch_share_sheet
                                });


                                resolve("Whatever");
                            }
                        },
                        {
                            title: $l10n("Exit"),
                            handler: function () {
                                utils.stopScript();
                            }
                        }
                    ]
                });


            } else {
                resolve("Whatever");
            }
        });

    }
}


function jpg_or_not() {
    return new Promise(function (resolve, reject) {
        resolve("Whatever");
        if (user_data === undefined) {


            $ui.alert({
                title: $l10n("Please select jpg files"),
                message: $l10n("This script uses piexifjs library to modify exif and does only support JPG and JPEG."),
                actions: [
                    {
                        title: $l10n("Exit"),
                        handler: function () {
                            utils.stopScript();
                        }
                    }
                ]
            });


        } else {
            resolve("Whatever");
        }
    });
}


function use_default_exif_or_not() {
    return new Promise(function (resolve, reject) {

        if ((exifObj["GPS"]["1"] && exifObj["0th"]["306"] && exifObj["Exif"]["36867"])) {
            resolve("Whatever");
        } else {
            $ui.alert({
                title: $l10n("Incomplete exif data"),
                message: $l10n("Missing exif info will be replaced with default data and you can modify if you want."),
                actions: [
                    {
                        title: "OK",
                        handler: function () {
                            if (!(exifObj["GPS"]["1"])) {
                                exifObj["GPS"] = default_exifObj["GPS"];
                            }

                            if (!(exifObj["0th"]["306"])) {
                                exifObj["0th"] = default_exifObj["0th"];
                            }

                            if (!(exifObj["Exif"]["36867"])) {
                                exifObj["Exif"] = default_exifObj["Exif"];
                            }


                            // exifObj["1st"] = exifObj["1st"] || default_exifObj["1st"];
                            resolve("Whatever");
                        }
                    },
                    {
                        title: "Exit",
                        handler: function () {
                            utils.stopScript();
                        }
                    }
                ]
            })
        }


    });
}


function store_original_exif(original_photo_data) {

    return new Promise(function (resolve, reject) {

        // $ui.alert(original_photo_data.info["mimeType"].slice(6,));

        // $ui.render(loading_view);

        if ((original_photo_data.info["mimeType"].slice(6,) !== "jpeg")
            && (original_photo_data.info["mimeType"].slice(6,)) !== "jpg") {
            $ui.alert({
                title: $l10n("Please select jpg files"),
                message: $l10n("This script uses piexifjs library to modify exif and does only support JPG and JPEG.")
                + "\n\n" + $l10n("The format of your choice is: ") + original_photo_data.info["mimeType"].slice(6,),
                actions: [
                    {
                        title: $l10n("Exit"),
                        handler: function () {
                            utils.stopScript();
                        }
                    }
                ]
            })
        } else {
            image_data_base64 = "data:image/jpg;base64," + $text.base64Encode(original_photo_data);
            console.log("image_data_base64:");
            console.log(image_data_base64);

            try {
                exifObj = piexif.load(image_data_base64);

                // $ui.alert(exifObj);
                use_default_exif_or_not().then(function () {
                    console.log("exifObj:");
                    console.log(exifObj);
                    // $ui.alert("adsfsad");
                    console.log($l10n("Device Maker:"));
                    console.log(exifObj["0th"]["271"]);

                    console.log($l10n("Device Model:"));
                    console.log(exifObj["0th"]["272"]);

                    console.log($l10n("Lens Details:"));
                    console.log(exifObj["Exif"]["42036"]);

                    console.log($l10n("Create Time:"));
                    console.log(exifObj["0th"]["306"]);

                    console.log($l10n("Create Time:"));
                    console.log(exifObj["0th"]["306"]);

                    console.log($l10n("Latitude:"));
                    console.log($l10n(exifObj["GPS"]["1"]));
                    console.log(exifObj["GPS"]["2"]["0"]["0"] + "°" + exifObj["GPS"]["2"]["1"]["0"] + "\'" + exifObj["GPS"]["2"]["2"]["0"] + "\"");
                    console.log($l10n("Longitude:"));

                    console.log(exifObj["GPS"]["4"]["0"]["0"] + "°" + exifObj["GPS"]["4"]["1"]["0"] + "\'" + exifObj["GPS"]["4"]["2"]["0"] + "\"");
                    resolve("Whatever");
                })
            } catch (e) {
                $ui.alert({
                    title: $l10n("Please select jpg files"),
                    message: $l10n("This script uses piexifjs library to modify exif and does only support JPG and JPEG."),
                    actions: [
                        {
                            title: $l10n("Exit"),
                            handler: function () {
                                utils.stopScript();
                            }
                        }
                    ]
                });
            }
        }


    });
}


function generate_new_photo_with_original_exif(compressed_photo_data_without_exif) {
    exifObj_original["0th"][piexif.ImageIFD.Orientation] = 0;
    let exifbytes = piexif.dump(exifObj_original);
    image_data_base64 = "data:image/jpg;base64," + $text.base64Encode(compressed_photo_data_without_exif);
    let new_photo_base64 = piexif.insert(exifbytes, image_data_base64);
    return $data({
        url: new_photo_base64
    })
}


const exifModifyView = {
    props: {
        id: "main_view",
        title: $l10n("EXIF Modify"),
    },
    views: [

        // Device Maker
        {
            type: "label",
            props: {
                text: $l10n("Device Maker:"),
                textColor: $color("darkGray")
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(1));
                make.left.equalTo(deviceScreenWidth / 10);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth / 3);
            }
        },
        {
            type: "input",
            props: {
                id: "device_maker_input",
                type: $kbType.search,
                darkKeyboard: true,
                text: "",
            },
            layout: function (make, view) {
                make.top.equalTo(input_element_top(1));
                make.left.equalTo(deviceScreenWidth / 2);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth / 2.1);
            },
            events: {
                changed: function (sender) {
                    exifObj["0th"]["271"] = $("device_maker_input").text;
                },
                returned: function (sender) {
                    console.log(exifObj["0th"]["271"]);
                    sender.blur();
                }
            }

        },

        // Device Model
        {
            type: "label",
            props: {
                text: $l10n("Device Model:"),
                textColor: $color("darkGray")
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(2));
                make.left.equalTo(deviceScreenWidth / 10);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth / 3);
            }
        },
        {
            type: "input",
            props: {
                id: "device_model_input",
                type: $kbType.search,
                darkKeyboard: true,
                text: "",
            },
            layout: function (make, view) {
                make.top.equalTo(input_element_top(2));
                make.left.equalTo(deviceScreenWidth / 2);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth / 2.1);
            },
            events: {
                changed: function (sender) {
                    exifObj["0th"]["272"] = $("device_model_input").text;
                },
                returned: function (sender) {
                    console.log(exifObj["0th"]["272"]);
                    sender.blur();
                }
            }
        },

        // Lens Model
        {
            type: "label",
            props: {
                text: $l10n("Lens Model:"),
                textColor: $color("darkGray")
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(3));
                make.left.equalTo(deviceScreenWidth / 10);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth / 3);
            }
        },
        {
            type: "input",
            props: {
                id: "lens_model_input",
                type: $kbType.search,
                darkKeyboard: true,
                text: "",
            },
            layout: function (make, view) {
                make.top.equalTo(input_element_top(3));
                make.left.equalTo(deviceScreenWidth / 2);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth / 2.1);
            },
            events: {
                changed: function (sender) {
                    exifObj["Exif"]["42036"] = $("lens_model_input").text;
                },
                returned: function (sender) {
                    console.log(exifObj["Exif"]["42036"]);
                    sender.blur();
                }
            }

        },

        // Resolution
        {
            type: "label",
            props: {
                text: $l10n("Resolution:"),
                textColor: $color("darkGray")
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(4));
                make.left.equalTo(deviceScreenWidth / 10);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.3);
            }
        },
        {
            type: "label",
            props: {
                id: "resolution_label",
                text: "0 * 0",
                textColor: $color("darkGray")
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(4));
                make.left.equalTo(deviceScreenWidth / 2);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth / 2.1);
            }
        },

        // Time
        {
            type: "label",
            props: {
                text: $l10n("Create Time:"),
                textColor: $color("darkGray")
            },
            layout: function (make) {
                make.top.equalTo(input_element_top(5));
                make.left.equalTo(deviceScreenWidth / 10);
                // make.centerX.equalTo(0).offset(20);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.3);
            }
        },
        {
            type: "button",
            props: {
                id: "modify_time_button",
                title: "",
            },
            layout: function (make) {

                make.top.equalTo(input_element_top(5));
                make.left.equalTo(deviceScreenWidth * 0.5);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.48);

            },
            events: {
                tapped: function (sender) {
                    // $ui.push(timeModifyView);
                    $("main_view").add(timeModifyView);
                    // $delay(2, function () {
                    //     $("time_modify_view").remove();
                    //
                    // });
                    $("photo_date_picker_day").date = photo_date;
                    $("photo_date_picker_time").date = photo_date;

                }
            }
        },


        // map
        {
            type: "map",
            props: {
                id: "photo_gps_view",
                location: {
                    lat: 31.2990,
                    lng: 120.5853
                }
            },
            layout: function (make, view) {
                make.top.equalTo(input_element_top(6));
                // make.bottom.equalTo(deviceScreenHeight - 20);
                make.left.equalTo(0);
                make.height.equalTo(deviceScreenHeight - input_element_top(6));
                make.width.equalTo(deviceScreenWidth * 1);

            }
        },
        {
            type: "button",
            props: {
                id: "modify_gps_button",
                // title: $l10n("Tap & Modify"),
                icon: $icon("129", $color("white"), $size(28, 28)),
            },
            layout: function (make) {

                make.top.equalTo(input_element_top(6));
                make.left.equalTo(deviceScreenWidth * 0.01);
                make.height.equalTo(50);
                make.width.equalTo(50);

            },
            events: {
                tapped: function (sender) {
                    $location.select({
                        handler: function (result) {
                            let lat = result.lat;
                            let lng = result.lng;
                            lat = gps_decimal_to_sexagecimal(lat);
                            lng = gps_decimal_to_sexagecimal(lng);

                            exifObj["GPS"]["2"]["0"]["0"] = lat[0];
                            exifObj["GPS"]["2"]["1"]["0"] = lat[1];
                            exifObj["GPS"]["2"]["2"]["0"] = lat[2];

                            exifObj["GPS"]["4"]["0"]["0"] = lng[0];
                            exifObj["GPS"]["4"]["1"]["0"] = lng[1];
                            exifObj["GPS"]["4"]["2"]["0"] = lng[2];

                            $("photo_gps_view").location = {
                                lat: gps_sexagecimal_to_decimal(
                                    exifObj["GPS"]["2"]["0"]["0"],
                                    exifObj["GPS"]["2"]["1"]["0"],
                                    exifObj["GPS"]["2"]["2"]["0"]
                                ),
                                lng: gps_sexagecimal_to_decimal(
                                    exifObj["GPS"]["4"]["0"]["0"],
                                    exifObj["GPS"]["4"]["1"]["0"],
                                    exifObj["GPS"]["4"]["2"]["0"]
                                )
                            };
                        }
                    })
                }
            }
        },


        // Finish
        {
            type: "button",
            props: {
                id: "finish_button",
                title: $l10n("Save & Exit"),
            },
            layout: function (make) {
                make.top.equalTo(deviceScreenHeight * 0.82);
                // make.left.equalTo(deviceScreenWidth * 0.23);
                make.centerX.equalTo(0).offset(0);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.618 / 2);
            },
            events: {
                tapped: function (sender) {
                    let exifbytes = piexif.dump(exifObj);
                    image_data_base64 = piexif.insert(exifbytes, image_data_base64);
                    $photo.save({
                        data: $data({
                            url: image_data_base64
                        }),
                        handler: function (result) {
                            if (result === true) {
                                $ui.toast($l10n("Saved successfully."), 1);
                                utils.tapticTaptic(9);
                                $delay(1.5, function () {
                                    utils.stopScript();
                                });
                            } else {
                                $ui.alert({
                                    title: "Error",
                                    message: result
                                });
                                utils.stopScript();
                            }
                        }
                    })

                }
            }
        },
    ]
};


const timeModifyView = {
    props: {
        title: $l10n("Time Modify"),
        id: "time_modify_view"
    },
    layout: function (make, view) {
        make.top.equalTo(0);
        make.left.equalTo(0);
        make.height.equalTo(deviceScreenHeight);
        make.width.equalTo(deviceScreenWidth);
    },
    views: [
        {
            type: "view",
            props: {
                bgcolor: $color("#E6E6FA"),
                // smoothRadius: 80,
                // opaque: false,
                // tintColor: $color("#fa754a"),
                // borderWidth: 1,
                // borderColor: $color("#4b96fa"),
                alpha: 0.75
            },
            layout: function (make, view) {
                make.top.equalTo(0);
                make.left.equalTo(0);
                make.height.equalTo(deviceScreenHeight);
                make.width.equalTo(deviceScreenWidth);
            },
            events: {
                tapped: function (sender) {

                }
            }
        },
        {
            type: "view",
            props: {
                bgcolor: $color("#E6E6FA"),
                smoothRadius: 80,
                // opaque: false,
                // tintColor: $color("#fa754a"),
                // borderWidth: 1,
                borderColor: $color("#4b96fa"),
                alpha: 0.618
            },
            layout: function (make, view) {
                make.top.equalTo(deviceScreenHeight * 0.01);
                make.left.equalTo(deviceScreenWidth * 0.07);
                make.height.equalTo(deviceScreenHeight * 0.37);
                make.width.equalTo(deviceScreenWidth * 0.86);
            },
            events: {
                tapped: function (sender) {

                }
            }
        },
        {
            type: "view",
            props: {
                bgcolor: $color("#E6E6FA"),
                smoothRadius: 80,
                // opaque: false,
                // tintColor: $color("#fa754a"),
                // borderWidth: 1,
                borderColor: $color("#4b96fa"),
                alpha: 0.618
            },
            layout: function (make, view) {
                make.top.equalTo(deviceScreenHeight * 0.39);
                make.left.equalTo(deviceScreenWidth * 0.07);
                make.height.equalTo(deviceScreenHeight * 0.37);
                make.width.equalTo(deviceScreenWidth * 0.86);
            },
            events: {
                tapped: function (sender) {

                }
            }
        },
        {
            type: "date-picker",
            props: {
                id: "photo_date_picker_day",
                interval: 1,
                date: new Date(),
                mode: 1

            },
            layout: function (make) {
                make.top.equalTo(deviceScreenHeight * 0.01);
                make.left.equalTo(deviceScreenWidth * 0.07);
                make.height.equalTo(deviceScreenHeight * 0.37);
                make.width.equalTo(deviceScreenWidth * 0.86);
            },
            events: {
                changed: function (sender) {
                    // taskStartTime = formatTimeForOmniFocus(sender.date);


                    exifObj["Exif"]["36867"] = sender.date.getFullYear()
                        + ":"
                        + ("00" + (sender.date.getMonth() + 1)).slice(-2)
                        + ":"
                        + ("00" + sender.date.getDate()).slice(-2)
                        + exifObj["Exif"]["36867"].slice(10, 19);

                    $("modify_time_button").title = exifObj["Exif"]["36867"].slice(0, 4)
                        + "-"
                        + exifObj["Exif"]["36867"].slice(5, 7)
                        + "-"
                        + exifObj["Exif"]["36867"].slice(8, 10)
                        + " "
                        + exifObj["Exif"]["36867"].slice(11, 13)
                        + ":"
                        + exifObj["Exif"]["36867"].slice(14, 16)
                        + ":"
                        + exifObj["Exif"]["36867"].slice(17, 19);

                }
            }
        },
        {
            type: "date-picker",
            props: {
                id: "photo_date_picker_time",
                interval: 1,
                date: new Date(),
                mode: 3

            },
            layout: function (make) {
                make.top.equalTo(deviceScreenHeight * 0.39);
                make.left.equalTo(deviceScreenWidth * 0.07);
                make.height.equalTo(deviceScreenHeight * 0.37);
                make.width.equalTo(deviceScreenWidth * 0.96);
            },
            events: {
                changed: function (sender) {
                    // taskStartTime = formatTimeForOmniFocus(sender.date);


                    exifObj["Exif"]["36867"] = exifObj["Exif"]["36867"].slice(0, 11)
                        + ("00" + sender.date.getHours()).slice(-2)
                        + ":"
                        + ("00" + sender.date.getMinutes()).slice(-2)
                        + ":"
                        + ("00" + sender.date.getSeconds()).slice(-2);

                    $("modify_time_button").title = exifObj["Exif"]["36867"].slice(0, 4)
                        + "-"
                        + exifObj["Exif"]["36867"].slice(5, 7)
                        + "-"
                        + exifObj["Exif"]["36867"].slice(8, 10)
                        + " "
                        + exifObj["Exif"]["36867"].slice(11, 13)
                        + ":"
                        + exifObj["Exif"]["36867"].slice(14, 16)
                        + ":"
                        + exifObj["Exif"]["36867"].slice(17, 19);


                }
            }
        },
        {
            type: "button",
            props: {
                id: "save_time_button",
                title: $l10n("OK"),
            },
            layout: function (make) {
                make.top.equalTo(deviceScreenHeight * 0.78);
                // make.left.equalTo(deviceScreenWidth * 0.50);
                make.centerX.equalTo(0).offset(0);
                make.height.equalTo(input_element_height);
                make.width.equalTo(deviceScreenWidth * 0.30);
            },
            events: {
                tapped: function (sender) {
                    $("time_modify_view").remove();
                }
            }
        }
    ]
};


const loading_view = {
    props: {
        id: "loading_view",
        title: $l10n("Loading ..."),
    },
    views: [
        {
            type: "web",
            props: {
                id: "web_view_test",
                html: html_template
            },
            layout: $layout.fill,
            events: {}
        }


    ]
};


// TODO
if (($app.env !== $env.app) && ($app.env !== $env.action)) {
    let jump_url = "jsbox://run?name=" + $text.URLEncode($addin.current.name);
    $ui.alert({
        title: $l10n("Please run in JSBox APP"),
        actions: [
            {
                title: "Jump to JSBox APP",
                handler: function () {
                    $app.openURL(jump_url);
                }
            },
            {
                title: "Exit",
                handler: function () {
                    utils.stopScript();
                }
            }
        ]
    })

} else if ($app.env === $env.action) {
    let jump_url = "jsbox://run?name=" + $text.URLEncode($addin.current.name) + "&use_clipboard=true";
    show_tips().then(function () {
        if ($context.data) {
            $clipboard.image = $context.data;
            $app.openURL(jump_url);
        } else {
            utils.stopScript();
        }

    });
} else if ($app.env === $env.app) {
    show_tips().then(function () {
        if ($context.query["use_clipboard"] === "true") {


            $ui.render(loading_view);

            $delay(0.6, function () {
                image_data = $clipboard.image;
                // $ui.alert(resp.data.info);

                store_original_exif(image_data).then(function () {
                    let photo_date_string = exifObj["Exif"]["36867"];
                    photo_date = new Date(
                        photo_date_string.slice(0, 4),
                        photo_date_string.slice(5, 7) - 1,
                        photo_date_string.slice(8, 10),
                        photo_date_string.slice(11, 13),
                        photo_date_string.slice(14, 16),
                        photo_date_string.slice(17, 19),
                    );
                    console.log(exifObj["0th"]["271"]);
                    $ui.render(exifModifyView);
                    $("device_maker_input").text = exifObj["0th"]["271"];
                    $("device_model_input").text = exifObj["0th"]["272"];
                    $("lens_model_input").text = exifObj["Exif"]["42036"];
                    $("resolution_label").text = exifObj["Exif"]["40963"] + " * " + exifObj["Exif"]["40962"];
                    if (exifObj["Exif"]["40963"] === 1 && exifObj["Exif"]["40962"] === 1) {
                        $("resolution_label").text = "";
                    }


                    $("modify_time_button").title = photo_date_string.slice(0, 4)
                        + "-"
                        + photo_date_string.slice(5, 7)
                        + "-"
                        + photo_date_string.slice(8, 10)
                        + " "
                        + photo_date_string.slice(11, 13)
                        + ":"
                        + photo_date_string.slice(14, 16)
                        + ":"
                        + photo_date_string.slice(17, 19);

                    $("photo_gps_view").location = {
                        lat: gps_sexagecimal_to_decimal(
                            exifObj["GPS"]["2"]["0"]["0"],
                            exifObj["GPS"]["2"]["1"]["0"],
                            exifObj["GPS"]["2"]["2"]["0"]
                        ),
                        lng: gps_sexagecimal_to_decimal(
                            exifObj["GPS"]["4"]["0"]["0"],
                            exifObj["GPS"]["4"]["1"]["0"],
                            exifObj["GPS"]["4"]["2"]["0"]
                        )
                    };

                    console.log(gps_sexagecimal_to_decimal(
                        exifObj["GPS"]["2"]["0"]["0"],
                        exifObj["GPS"]["2"]["1"]["0"],
                        exifObj["GPS"]["2"]["2"]["0"]
                    ));
                })

            });


        } else {
            $photo.pick({
                multi: false,
                format: "data",
                handler: function (resp) {
                    if (resp["status"] === "false"
                        || resp["status"] === 0
                        || resp["status"] === false
                        || resp["status"] === "0") {
                        utils.stopScript();
                    } else {
                        $ui.render(loading_view);

                        $delay(0.6, function () {
                            image_data = resp.data;
                            // $ui.alert(resp.data.info);

                            store_original_exif(image_data).then(function () {
                                let photo_date_string = exifObj["Exif"]["36867"];
                                photo_date = new Date(
                                    photo_date_string.slice(0, 4),
                                    photo_date_string.slice(5, 7) - 1,
                                    photo_date_string.slice(8, 10),
                                    photo_date_string.slice(11, 13),
                                    photo_date_string.slice(14, 16),
                                    photo_date_string.slice(17, 19),
                                );
                                console.log(exifObj["0th"]["271"]);
                                $ui.render(exifModifyView);
                                $("device_maker_input").text = exifObj["0th"]["271"];
                                $("device_model_input").text = exifObj["0th"]["272"];
                                $("lens_model_input").text = exifObj["Exif"]["42036"];
                                $("resolution_label").text = exifObj["Exif"]["40963"] + " * " + exifObj["Exif"]["40962"];
                                if (exifObj["Exif"]["40963"] === 1 && exifObj["Exif"]["40962"] === 1) {
                                    $("resolution_label").text = "";
                                }


                                $("modify_time_button").title = photo_date_string.slice(0, 4)
                                    + "-"
                                    + photo_date_string.slice(5, 7)
                                    + "-"
                                    + photo_date_string.slice(8, 10)
                                    + " "
                                    + photo_date_string.slice(11, 13)
                                    + ":"
                                    + photo_date_string.slice(14, 16)
                                    + ":"
                                    + photo_date_string.slice(17, 19);

                                $("photo_gps_view").location = {
                                    lat: gps_sexagecimal_to_decimal(
                                        exifObj["GPS"]["2"]["0"]["0"],
                                        exifObj["GPS"]["2"]["1"]["0"],
                                        exifObj["GPS"]["2"]["2"]["0"]
                                    ),
                                    lng: gps_sexagecimal_to_decimal(
                                        exifObj["GPS"]["4"]["0"]["0"],
                                        exifObj["GPS"]["4"]["1"]["0"],
                                        exifObj["GPS"]["4"]["2"]["0"]
                                    )
                                };

                                console.log(gps_sexagecimal_to_decimal(
                                    exifObj["GPS"]["2"]["0"]["0"],
                                    exifObj["GPS"]["2"]["1"]["0"],
                                    exifObj["GPS"]["2"]["2"]["0"]
                                ));
                            })

                        });
                    }


                }
            })

        }
    })
}



