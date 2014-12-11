class ErrorsController < ApplicationController
   layout "base_layout"
   def error404
      render status: :not_found
   end
end
