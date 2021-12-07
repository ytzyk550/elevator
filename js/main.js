
class ElevatorChallenge {

    buildings = []
    constructor() {
        this.sumBuildings = config.sumBuildings
        this.init()
    }

    // Initialize buildings
    init() {
        for (let i = 0; i < this.sumBuildings; i++) {
            this.buildings.push(new Building(i+1))
        }
    }
}

class Building {
    
    // Object to hold the elevators arrival statuses
    elevatorsStatus = {}
    
    constructor(buildingId) {
        this.buildingId = buildingId
        this.sumFloors = config.sumFloors
        this.sumElevators = config.sumElevators
        this.init()
    }

/////////////// Initializers ///////////////////

    // Initialize the building
    init() {
        this.createBuilding(this.sumFloors)
        this.createElevators(this.sumElevators)
    }

    // Build the UI for the building
    createBuilding(floors = this.sumFloors) {
        let buildingArea = $('<div/>', {
                class: 'buildingArea'
        })
        let building = $('<div/>', {
                class: 'building',
                id: 'building-' + this.buildingId
        })
        
        let elevators = $('<div/>', {
            class: 'elevators',
            id: 'elevators-' + this.buildingId
        })
            
        buildingArea.append(building, elevators)
        buildingArea.appendTo('#buildings');
        this.createFloors(floors)
    }

    // Build the UI for the floors, with building-id
    createFloors(floors = this.sumFloors) {
        for (let i = floors; i >= 0; i--) {
            let floor = $('<div/>', {
                class: 'floor',
                id: `floor-${ this.buildingId}-${i}`
            })
            let blackline = $('<div/>', {
                class: 'blackline'
            })
            let waittime = $('<span/>', {
                text: '',
                class: 'waittime'
            })
            let button = $('<button/>', {
                text: i,
                class: 'metal linear'
            }).on('click', () => this.callElevatorToFloor(i))
            floor.append(blackline, button, waittime)
            floor.appendTo('#building-' + this.buildingId);
        }
    }

    // Build the UI for the elevators, with building-id
    createElevators(elevators = this.sumElevators) {
        for (let i = 1; i <= elevators; i++) {
            this.elevatorsStatus[i] = {floor: 0, isFreeOn: new Date(new Date().getTime())}
            $('<img/>', {
                class: 'elevator',
                id: `elevator-${ this.buildingId}-${i}`,
                src: "assets/elv.png"
            }).css({ left: 300 + (110 * (i - 1)) })
                .appendTo('#elevators-' + this.buildingId);
        }
    }

/////////////////// Actions /////////////////////

    // User clicked on the floor-button.
    callElevatorToFloor(floor = 0) {

        // Calculate fastest way and call elevator, then update the wait time view on floor
        let way = this.getFastestWay(floor)
        this.updateWaitTime(floor, way.arrivalTime)
        // Move...
        this.moveElevatorToFloor(floor, way.speed, way.elevator)
    }

    // Find an elevator that will arrive the fastest, 
    //      Returns - elevator-id, duration, and arrival-time.
    getFastestWay(floor = 0) {

        // Find fastest elevator.
        const elevatorsArrivalTimes = this.getElevatorsArrivalTimes(floor)
        const fastestElevator = this.getFastestElevatorName( elevatorsArrivalTimes )
        const fastestElevatorTime = elevatorsArrivalTimes[fastestElevator]
        const duration = this.calculatDuration(this.elevatorsStatus[fastestElevator].floor, floor)
        
        // Update the elevator status.
        const waitTime = 2000
        this.elevatorsStatus[fastestElevator] = { floor: floor, isFreeOn: fastestElevatorTime + waitTime }
        
        return { elevator: fastestElevator, speed: duration, arrivalTime: fastestElevatorTime }
    }

    // Returns object with arrival time of each elevator to given floor.
    getElevatorsArrivalTimes(floor = 0) {
        const elevatorsArrivalTimes = {}
        const currentTime = new Date().getTime()

        //For each elevator find the arrival time if selected.
        Object.keys(this.elevatorsStatus).forEach((k) => {
            const elevator = this.elevatorsStatus[k]
            const isFreeOn = (elevator.isFreeOn > currentTime) ? elevator.isFreeOn : currentTime
            
            let duration = this.calculatDuration(elevator.floor, floor)
            elevatorsArrivalTimes[k] = isFreeOn + duration
        })
        return elevatorsArrivalTimes
    }

    // Get the name of the fastest elevator
    getFastestElevatorName(elevatorsArrivalTimes) {
        
        // (Callback) Compare elevators arrival time, return the name of the fastest elevator.
        const getMinTime = (prevElevator, curElevator) =>{
            if (elevatorsArrivalTimes[curElevator] < elevatorsArrivalTimes[prevElevator]) {
                return curElevator
            }
            return prevElevator
        }
        // Compare all elevators, return the name of the fastest.
        let fastestElevatorName = Object.keys(elevatorsArrivalTimes).reduce(getMinTime);
        return fastestElevatorName
    }

    // Calculate the travel time from the current floor to the required floor.
    calculatDuration(currentFloor = 0, floor = 0) {
        const floorSpeed = 500
        let speed =  0
        if (currentFloor <= floor) {
            speed = (floor - currentFloor) * floorSpeed
        } else {
            speed = (currentFloor - floor) * floorSpeed
        }
        return speed
    }

    // Move elevator to floor
    moveElevatorToFloor(floor = 0, speed = 0, elevatorId = 1) {
        $(`#elevator-${this.buildingId}-${elevatorId}`)
            .animate({ bottom: (110 * floor).toString() + 'px' }, speed)
            .delay(2000);
    }

    // Display elevator arrival time on the given floor.
    startTimer(timer = 0, display) {

        display.text(timer);
        let interval = setInterval(() => {
            if (--timer < 0) {
                clearInterval(interval)
            } else {
                display.text(timer);
            }
        }, 1000);
    }

    // Change the button to green on waiting.
    changeButtonColorOnWait(floor = 0, timeout = 0) {
        let buttonElement = $(`div#floor-${this.buildingId}-${floor.toString()} > button.metal.linear`)
        buttonElement.addClass('waiting')
       
        setTimeout(() => {
            playSound()
            buttonElement.removeClass('waiting')     
        }, timeout*1000);
    }

    // DownCount until the elevator arrived.
    updateWaitTime(floor = 0, time) {
        let currentTime = new Date().getTime()
        let timer = Math.floor((time - currentTime) / 1000)
        let display = $(`div#floor-${this.buildingId}-${floor.toString()} > span.waittime`)
        
        this.changeButtonColorOnWait(floor, timer)
        this.startTimer(timer, display);
    }

}


// helper functions
function playSound() {
    const audio = new Audio('./assets/ding.mp3');
    audio.play()
}