function sayHello() {
    $ui.alert($l10n('HELLO_WORLD'));
}

function tapticTaptic(repeat_times) {
    for (let i = 0; i <= repeat_times; i++) {
        $delay(0.3 * i, function () {
            $device.taptic(2);
        })
    }
}


// TODO
function show_tips() {

}

module.exports = {
    sayHello: sayHello,
    tapticTaptic: tapticTaptic
};