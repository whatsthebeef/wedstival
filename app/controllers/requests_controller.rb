class RequestsController < ApplicationController
   layout "base_layout", except: :index
   before_filter :authenticate, except: :new 

   def index
      @requests = Request.all
   end

   def new
      @active_item = 4
      @request = Request.new 
   end

   def create
      @request = Request.new(request_params)
      if verify_recaptcha(model: @request, message: "You guessed the text wrong") && @request.save
         flash[:notice] = "Your request has been sent"
         redirect_to new_request_path
      else 
         render "new"
      end
   end

   private 
   def request_params
      params.require(:request).permit(:artist, :song_title)
   end
end
