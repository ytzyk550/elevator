
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
    elevatorQueues = {}
    
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
            this.elevatorQueues[i] = {floor: 0, isFreeOn: new Date(new Date().getTime())}
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
        this.moveElevatorToFloor(floor, way.speed, way.elevator)
    }

    // Find an elevator that will arrive the fastest.
    getFastestWay(floor = 0) {
        const queues = {}
        let currentTime = new Date().getTime()
        let waitTime = 2000

        //for each elevator find the arrival time if you choose it.
        Object.keys(this.elevatorQueues).forEach((k) => {
            let queue = this.elevatorQueues[k]
            let isFreeOn = (queue.isFreeOn > currentTime)? queue.isFreeOn : currentTime
            let elevatorToFloor = this.calculatArrivalTime(queue.floor, floor)
            queues[k] = isFreeOn + elevatorToFloor
        })
        
        let key = Object.keys(queues).reduce((key, v) => queues[v] < queues[key] ? v : key);
        let speed = this.calculatArrivalTime(this.elevatorQueues[key].floor, floor)
        this.elevatorQueues[key]={ floor: floor, isFreeOn: queues[key]+waitTime }

        return { elevator: key, speed: speed, arrivalTime: queues[key] }
    }

    // Calculate the arrival time from current-floor to required floor.
    calculatArrivalTime(currentFloor = 0, floor = 0) {
        let speed =  0
        if (currentFloor <= floor) {
            speed = (floor - currentFloor) * 500
        } else {
            speed = (currentFloor - floor) * 500
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