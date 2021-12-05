
class ElevatorChallenge {

    buildings = []
    constructor() {
        this.sumBuildings = config.sumBuildings
        this.init()
    }

    // Initialize buildings
    init() {
        for (var i = 0; i < this.sumBuildings; i++) {
            this.buildings.push(new Building(i+1))
        }
    }
}

class Building {
    
    // Object to hold the elevators arival statuses
    elevatorQueues = {}
    
    constructor(buildingId) {
        this.buildingId = buildingId
        this.sumFloors = config.sumFloors
        this.sumElevators = config.sumElevators
        this.init()
    }

    // Initialize the building
    init() {
        this.createBuilding(this.sumFloors)
        this.createElevators(this.sumElevators)
    }

    
    createBuilding(floors) {
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


    createFloors(floors) {
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

    createElevators(elevators) {
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

    getFastesWay(floor) {
        let queues = {}
        let currentTime = new Date().getTime()
        let waitTime = 2000

        Object.keys(this.elevatorQueues).forEach((k) => {
            let queue = this.elevatorQueues[k]
            let isFreeOn = (queue.isFreeOn > currentTime)? queue.isFreeOn : currentTime
            let elevatorToFloor = this.calculatArivalTime(queue.floor, floor)
            queues[k] = isFreeOn + elevatorToFloor
        })
        
        let key = Object.keys(queues).reduce((key, v) => queues[v] < queues[key] ? v : key);
        this.elevatorQueues[key]={ floor: floor, isFreeOn: queues[key]+waitTime }

        let speed = this.calculatArivalTime(this.elevatorQueues[key].floor, floor)

        return { elevator: key, speed: speed, arivalTime: queues[key] }
    }

    
    calculatArivalTime(currentFloor, floor) {
        let speed =  0
        if (currentFloor <= floor) {
            speed = (floor - currentFloor) * 500
        } else {
            speed = (currentFloor - floor) * 500
        }
        return speed
    }


  
    
    startTimer(timer, display) {
        
        display.text(timer);

        let interval = setInterval(() => {
            
            if (--timer < 0) {
                clearInterval(interval)
            } else {
            display.text(timer);
            }
        }, 1000);
    }



    changeButtonColorOnWait(floor, timeout) {
        let buttonElement = $(`div#floor-${this.buildingId}-${floor.toString()} > button.metal.linear`)
        buttonElement.addClass('waiting')
        setTimeout(() => {
            playSound()
            buttonElement.removeClass('waiting')     
        }, timeout*1000);
    }

    updateWaitTime(floor, time) {
        let currentTime = new Date().getTime()
        let timer = Math.ceil((time - currentTime) / 1000)
        
        this.changeButtonColorOnWait(floor, timer)

        let display = $(`div#floor-${this.buildingId}-${floor.toString()} > span.waittime`)
    this.startTimer(timer, display);

    }

    callElevatorToFloor(floor) {
        let way = this.getFastesWay(floor)
        this.updateWaitTime(floor, way.arivalTime)
        this.moveElevatorToFloor(floor, way.speed, way.elevator)
    }


    moveElevatorToFloor(floor, speed, elevatorId) {
        $(`#elevator-${this.buildingId}-${elevatorId}`)
            .animate({ bottom: (110 * floor).toString() + 'px' }, speed)
            .delay(2000);
    }

    

}


// helper functions
function playSound() {
        const audio = new Audio('./assets/ding.mp3');
        audio.play()
    }