import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../auth/login.service';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument
} from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js';
import * as moment from 'moment';

@Component({
  selector: 'app-maradash',
  templateUrl: './maradash.component.html',
  styleUrls: ['./maradash.component.css']
})
export class MaradashComponent implements OnInit {
  user: firebase.User;
  robloxId: number;
  name: string;
  digigotRobloxUser = false;
  digiRobloxAvatar: string;
  digiLoading = false;
  digiRobloxUsername: string;
  digiTokens: number;
  digiSessionsAttended: number;
  digiActivityScore: number;
  digiWarningsUsed: number;
  digiMaraScore: number;
  digiGotData = false;
  digiBalance: number;

  sessionTimes: any;
  sessionDays: any;
  inactiveDays: any;

  warning1Time: any;
  warning2Time: any;
  warning1Issuer: string;
  warning2Issuer: string;
  warning1Reason: string;
  warning2Reason: string;
  warning1Show = false;
  warning2Show = false;
  ctaMessage: string;

  constructor(
    private service: LoginService,
    private router: Router,
    private db: AngularFirestore,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.service.getLoggedInUser().subscribe(user => {
      if (!user) {
        this.router.navigate(['/']);
      }
      this.user = user;
      if (user) {
        this.db
          .collection('users')
          .doc(localStorage.getItem('id'))
          .ref.onSnapshot(doc => {
            if (doc.exists) {
              if (doc.data().maraDigiDash === 'NJVkR') {
                if (doc.data().robloxId === undefined) {
                  this.router.navigate(['/']);
                } else {
                  const robloxId = doc.data().robloxId;
                  this.robloxId = doc.data().robloxId;

                  this.http
                    .get<any>(
                      `https://api.campfirebot.xyz/roblox/username/${robloxId}`
                    )
                    .subscribe(data => {
                      const parsed = JSON.parse(data);
                      this.name = parsed.Username;
                    });
                }
              } else {
                this.router.navigate(['/']);
                setTimeout(() => {
                  window.alert(
                    // tslint:disable-next-line: quotemark
                    "You're not permitted to use the MaraDash. If you believe this an error, please contact IT Support."
                  );
                }, 2000);
              }
            }
          });
      }
    });
  }

  searchUser(data) {
    this.digiLoading = true;
    this.http
      .get<any>(
        `https://api.campfirebot.xyz/maradigi/usersearch/${data.value.username}`
      )
      .subscribe(callback => {
        if (callback.exists === false) {
          this.digiLoading = false;
          // tslint:disable-next-line: quotemark
          return window.alert("User doesn't exist");
        } else {
          const id = callback.id;
          this.digiGotData = true;
          this.digiRobloxAvatar = `https://www.roblox.com/headshot-thumbnail/image?userId=${id}&width=100&height=100&format=png `;
          this.digiLoading = false;
          this.digiRobloxUsername = data.value.username;
          this.digiBalance = callback.data.balance;
          this.digiWarningsUsed = 3 - callback.data.warnings;
          this.digiActivityScore = callback.data.attendance;
          this.digiSessionsAttended =
            callback.data.sessions_attended[13] +
            callback.data.sessions_attended[15] +
            callback.data.sessions_attended[17] +
            callback.data.sessions_attended[19] +
            callback.data.sessions_attended[21] +
            callback.data.sessions_attended[23];
          this.digiMaraScore =
            (callback.data.warnings + callback.data.attendance) / 2;

          this.warning1Time = moment(
            callback.data.warning_1.time,
            'X'
          ).fromNow();
          this.warning1Show = callback.data.warning_1.issued;
          this.warning1Issuer = callback.data.warning_1.issuer;
          this.warning1Reason = callback.data.warning_1.reason;

          this.warning2Time = moment(
            callback.data.warning_2.time,
            'X'
          ).fromNow();
          this.warning2Show = callback.data.warning_2.issued;
          this.warning2Issuer = callback.data.warning_2.issuer;
          this.warning2Reason = callback.data.warning_2.reason;

          const ctx = document.getElementById('sessionTimes');
          this.sessionTimes = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: [
                '13:00 BST',
                '15:00 BST',
                '17:00 BST',
                '19:00 BST',
                '21:00 BST',
                '23:00 BST'
              ],
              datasets: [
                {
                  label: 'Number attended lifetime',
                  data: [
                    callback.data.sessions_attended[13],
                    callback.data.sessions_attended[15],
                    callback.data.sessions_attended[17],
                    callback.data.sessions_attended[19],
                    callback.data.sessions_attended[21],
                    callback.data.sessions_attended[23]
                  ],
                  fill: false,
                  lineTension: 0.1,
                  backgroundColor: [
                    '#e8b325',
                    '#e86025',
                    '#e83925',
                    '#e82569',
                    '#9325e8',
                    '#25e8ba'
                  ],
                  borderWidth: 3,
                  pointRadius: 0
                }
              ]
            },
            options: {
              legend: {
                display: false,
                position: 'bottom'
              },
              title: {
                text: 'Line Chart',
                display: false
              },
              scales: {
                yAxes: [
                  {
                    ticks: {
                      display: false
                    },
                    gridLines: {
                      zeroLineColor: 'transparent',
                      zeroLineWidth: 2,
                      drawTicks: false,
                      drawBorder: false,
                      color: 'transparent'
                    }
                  }
                ]
              }
            }
          });

          this.sessionDays = new Chart('sessionDays', {
            type: 'doughnut',
            data: {
              labels: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday'
              ],
              datasets: [
                {
                  label: 'Number attended lifetime',
                  data: [
                    callback.data.days_attended.monday,
                    callback.data.days_attended.tuesday,
                    callback.data.days_attended.wednesday,
                    callback.data.days_attended.thursday,
                    callback.data.days_attended.friday,
                    callback.data.days_attended.saturday,
                    callback.data.days_attended.sunday
                  ],
                  fill: false,
                  lineTension: 0.1,
                  backgroundColor: [
                    '#e8b325',
                    '#e86025',
                    '#e83925',
                    '#e82569',
                    '#9325e8',
                    '#25e8ba',
                    '#e8253c'
                  ],
                  borderWidth: 3,
                  pointRadius: 0
                }
              ]
            },
            options: {
              legend: {
                display: false,
                position: 'bottom'
              },
              title: {
                text: 'Line Chart',
                display: false
              },
              scales: {
                yAxes: [
                  {
                    ticks: {
                      display: false
                    },
                    gridLines: {
                      zeroLineColor: 'transparent',
                      zeroLineWidth: 2,
                      drawTicks: false,
                      drawBorder: false,
                      color: 'transparent'
                    }
                  }
                ]
              }
            }
          });

          this.inactiveDays = new Chart('inactiveDays', {
            type: 'doughnut',
            data: {
              labels: ['Inactive', 'Remaining inactive days'],
              datasets: [
                {
                  label: 'Number attended lifetime',
                  data: [
                    callback.data.inactive_days,
                    50 - callback.data.inactive_days
                  ],
                  fill: false,
                  lineTension: 0.1,
                  backgroundColor: ['#e82525', '#25e85c'],
                  borderWidth: 3,
                  pointRadius: 0
                }
              ]
            },
            options: {
              legend: {
                display: false,
                position: 'bottom'
              },
              title: {
                text: 'Line Chart',
                display: false
              },
              scales: {
                yAxes: [
                  {
                    ticks: {
                      display: false
                    },
                    gridLines: {
                      zeroLineColor: 'transparent',
                      zeroLineWidth: 2,
                      drawTicks: false,
                      drawBorder: false,
                      color: 'transparent'
                    }
                  }
                ]
              }
            }
          });
        }
      });
  }
}