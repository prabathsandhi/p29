import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common'; // Import CommonModule
import * as d3 from 'd3';

// Define a type for the chart data
interface ChartData {
  year: number;
  value: number;
}

@Component({
  selector: 'app-root',
  standalone: true, // Declare this as a standalone component
  imports: [FormsModule, HttpClientModule, CommonModule], // Add CommonModule here
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public loggedIn = false;
  public username = '';
  public password = '';
  public summary: any;
  public techStack: any;
  public chartData: ChartData[] = [];

  constructor(public router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.loggedIn = true;
      this.getDashboardData();
    }
  }

  login() {
    this.http.post<any>('http://localhost:3000/login', {
      username: this.username,
      password: this.password
    }).subscribe(response => {
      if (response.token) {
        localStorage.setItem('token', response.token);
        this.loggedIn = true;
        this.getDashboardData();
        this.router.navigate(['/dashboard']);
      }
    }, error => {
      alert('Invalid credentials');
    });
  }

  getDashboardData() {
    this.http.get<any>('http://localhost:3000/dashboard', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).subscribe(response => {
      this.summary = response.summary;
      this.techStack = response.tech_stack;
      this.getChartData();
    });
  }

  getChartData() {
    this.http.get<any>('http://localhost:3000/chart_data', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).subscribe(response => {
      this.chartData = response.data.filter((d: ChartData) => d.value !== undefined);
      this.renderChart();
    });
  }

  renderChart() {
    const data: ChartData[] = this.chartData;

    // Set up chart dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create an SVG element
    const svg = d3.select('#chartContainer')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set up scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.year.toString()))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value!)!]) // Use non-null assertion (!)
      .nice()
      .range([height, 0]);

    // Append bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.year.toString())!)
      .attr('y', d => y(d.value!)!)
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.value!)!)
      .attr('fill', 'steelblue');

    // Add axes
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y));
  }

  logout() {
    localStorage.removeItem('token');
    this.loggedIn = false;
    this.router.navigate(['/login']);
  }
}
