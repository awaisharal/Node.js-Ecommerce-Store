@extends('dashboard.partials.app2')
@section('title','Products')
@section('body')
@include('dashboard.partials.header')

		
	<div class="col-sm-9 col-sm-offset-3 col-lg-10 col-lg-offset-2 main">
		<div class="row">
			<ol class="breadcrumb">
				<li><a href="/dashboard">
					<em class="fa fa-home"></em>
				</a></li>
				<li class="active">Orders</li>
			</ol>
		</div><!--/.row-->
		
		<div class="row">
			<div class="col-lg-12">
				<h1 class="page-header">Orders</h1>
			</div>
		</div><!--/.row-->
		
		
		<div class="row">
			<div class="col-md-12">
				@foreach($orders as $order)
				<table class="table bordered">
					<thead>
						<th>Sr#</th>
						<th>Name</th>
						<th>Qty</th>
						<th>Price</th>
						<th>Action</th>
					</thead>
					<tbody>
						@php
							$i=1;
						@endphp
						
						@foreach($order->ordersItems() as $item)
						<tr>
							<td></td>
							<td>{{$item->name}}</td>
							{{-- <td>{{$order->user->orderItems()}}</td> --}}
							{{-- <td>{{$item->pivot->total }}</td> --}}
							<td>
								<i class="fa fa-trash"></i>
								<i class="fa fa-ban"></i>
							</td>
						</tr>
						@endforeach()
					</tbody>
				</table>
				@endforeach()
			</div>
		</div><!--/.row-->
	
	</div>	<!--/.main-->
	
	
		
@endsection 
@include('dashboard.partials.footer');