require File.expand_path('../boot', __FILE__)

require 'rails/all'

Bundler.require(:default, Rails.env)

module Wedstival
   class Application < Rails::Application
      config.serve_static_assets = true

      config.hash_string = ENV["WEDSTIVAL_HASH_STRING"]
      config.email = "us@johnandhinaswedding.website"


      config.filter_parameters << :password 
      require Rails.root.join("lib/custom_public_exceptions")
      config.exceptions_app = CustomPublicExceptions.new(Rails.public_path)
   end
end
