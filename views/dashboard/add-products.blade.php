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
				<li class="active">Add Products</li>
			</ol>
		</div><!--/.row-->
		
		<div class="row">
			<div class="col-lg-12">
				<h1 class="page-header">Add Products</h1>
			</div>
		</div><!--/.row-->
		
		
		<div class="row">
			<div class="col-md-12">
				<div class="col-lg-6 col-lg-offset-2" style="background: #fff;padding: 20px;border-radius:10px;margin-bottom: 70px;">
					
					<form action="" method="post" enctype="multipart/form-data">
						{{csrf_field()}}
						<div class="">
							<label for="title">Title</label>
							<input type="text" name="title" id="title" class="form-control">
						</div>
						<br>
						<div class="">
							<label for="file">Image</label>
							<input type="file" name="file" id="file" class="form-control">
						</div>
						<br>
						<div class="">
							<label for="desc">Product Description</label>
							<textarea name="desc" id="desc" class="form-control" cols="30" rows="10"></textarea>
						</div>
						<br>
						<div>
							<button class="btn btn-primary">Submit</button>
						</div>
					</form>
				</div>
			</div>
		</div><!--/.row-->
	
	</div>	<!--/.main-->
	
	
		
@endsection 
@include('dashboard.partials.footer');