
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

        // Motor links
        if (motor == Motor.Links || motor == Motor.Beide) {
            pins.analogWritePin(AnalogPin.P1, 0)
            pins.digitalWritePin(DigitalPin.P0, signal)
            pins.analogWritePin(AnalogPin.P1, tempo)
        }

        // Motor rechts
        if (motor == Motor.Rechts || motor == Motor.Beide) {
            pins.analogWritePin(AnalogPin.P3, 0)
            pins.digitalWritePin(DigitalPin.P2, signal)
            pins.analogWritePin(AnalogPin.P3, tempo)
        }
    }

    /**
     * Bluetooth-UART für LOFI Control starten.
     */
    //% blockId=mini_tank_lofi_bluetooth
    //% block="LOFI Bluetooth starten"
    //% weight=90
    export function bluetoothStarten(): void {
        bluetooth.startUartService()
    }
}
