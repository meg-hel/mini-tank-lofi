
/**
 * Mini Tank LOFI
 * Calliope mini V2
 *
 * Motor links:
 * P0 = Richtung
 * P1 = Tempo
 *
 * Motor rechts:
 * P2 = Richtung
 * P3 = Tempo
 */

//% color="#0D47A1" icon="\uf1b9" block="Mini Tank LOFI"
namespace miniTankLofi {

    export enum Motor {
        //% block="links"
        Links = 0,
        //% block="rechts"
        Rechts = 1,
        //% block="beide"
        Beide = 2
    }

    export enum Richtung {
        //% block="vorwärts"
        Vorwaerts = 0,
        //% block="rückwärts"
        Rueckwaerts = 1
    }

    export enum LofiTaste {
        //% block="↑"
        Hoch = 0,
        //% block="↓"
        Runter = 1,
        //% block="←"
        Links = 2,
        //% block="→"
        Rechts = 3
    }

    let lofiGestartet = false
    let letzteNachricht = 0
    let motorenAktiv = false
    let aktuelleTaste = -1
    let ereignisse: number[] = []
    let funktionen: (() => void)[] = []

    // Fahrzeiten in Millisekunden
    let fahrzeit = 150
    let drehzeit = 75

    /**
     * Einen oder beide Motoren steuern.
     * Tempo 0 bedeutet Motor aus.
     */
    //% blockId=mini_tank_lofi_motor
    //% block="Motor %motor Richtung %richtung Tempo %tempo"
    //% tempo.shadow=math_number_minmax
    //% tempo.min=0 tempo.max=700 tempo.defl=200
    //% weight=100
    export function motor(
        motor: Motor,
        richtung: Richtung,
        tempo: number
    ): void {

        if (tempo < 0) {
            tempo = 0
        }

        if (tempo > 700) {
            tempo = 700
        }

        let signal = richtung == Richtung.Vorwaerts ? 1 : 0

        if (motor == Motor.Links || motor == Motor.Beide) {
            pins.analogWritePin(AnalogPin.P1, 0)
            pins.digitalWritePin(DigitalPin.P0, signal)
            pins.analogWritePin(AnalogPin.P1, tempo)
        }

        if (motor == Motor.Rechts || motor == Motor.Beide) {
            pins.analogWritePin(AnalogPin.P3, 0)
            pins.digitalWritePin(DigitalPin.P2, signal)
            pins.analogWritePin(AnalogPin.P3, tempo)
        }

        if (tempo > 0) {
            motorenAktiv = true
            letzteNachricht = input.runningTime()
        } else if (motor == Motor.Beide) {
            motorenAktiv = false
        }
    }

    /**
     * Beide Motoren ausschalten.
     * Kein sichtbarer Schülerblock.
     */
    function stoppen(): void {
        pins.analogWritePin(AnalogPin.P1, 0)
        pins.analogWritePin(AnalogPin.P3, 0)
        motorenAktiv = false
    }

    /**
     * Bluetooth starten und LOFI-Befehle empfangen.
     */
    //% blockId=mini_tank_lofi_bluetooth
    //% block="LOFI Bluetooth starten"
    //% weight=90
    export function bluetoothStarten(): void {

        if (lofiGestartet) {
            return
        }

        lofiGestartet = true
        stoppen()

        bluetooth.startUartService()

        bluetooth.onBluetoothDisconnected(function () {
            stoppen()
        })

        control.inBackground(function () {
            while (true) {

                let befehl = bluetooth.uartReadUntil("\n")
                befehl = befehl.trim()

                let taste = -1

                if (befehl == "up") {
                    taste = LofiTaste.Hoch
                } else if (befehl == "down") {
                    taste = LofiTaste.Runter
                } else if (befehl == "left") {
                    taste = LofiTaste.Links
                } else if (befehl == "right") {
                    taste = LofiTaste.Rechts
                }

                if (taste >= 0) {
                    aktuelleTaste = taste
                    letzteNachricht = input.runningTime()

                    for (let i = 0; i < ereignisse.length; i++) {
                        if (ereignisse[i] == taste) {
                            funktionen[i]()
                        }
                    }
                }

                basic.pause(10)
            }
        })

        // Automatischer Sicherheitsstopp
        control.inBackground(function () {
            while (true) {
                if (motorenAktiv) {

                    let zeit = fahrzeit

                    if (
                        aktuelleTaste == LofiTaste.Links ||
                        aktuelleTaste == LofiTaste.Rechts
                    ) {
                        zeit = drehzeit
                    }

                    if (input.runningTime() - letzteNachricht >= zeit) {
                        stoppen()
                    }
                }

                basic.pause(20)
            }
        })
    }

    /**
     * Auf eine LOFI-Pfeiltaste reagieren.
     */
    //% blockId=mini_tank_lofi_taste
    //% block="wenn LOFI-Taste %taste empfangen"
    //% weight=80
    export function wennTaste(
        taste: LofiTaste,
        handler: () => void
    ): void {
        ereignisse.push(taste)
        funktionen.push(handler)
    }
}
