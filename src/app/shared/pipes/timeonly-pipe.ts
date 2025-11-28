import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeonly'
})
export class TimeonlyPipe implements PipeTransform {

  transform(value: string): string {

    let arr = value.split(":");
    if(Number(arr[0])>=12){
      let hour = Number(arr[0]) - 12;
      let ampm = "PM";
      return `${hour}:${arr[1]} ${ampm}`;
    }

    let ampm = "AM";
    return `${arr[0]}:${arr[1]} ${ampm}`;
  }

}
