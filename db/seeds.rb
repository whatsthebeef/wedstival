# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

User.create(username:"john", email:"john@zode64.com", 
            password:"#{Rails.configuration.john_p}", 
            password_confirmation:"#{Rails.configuration.john_p}") 
User.create(username:"hina", email:"hinathashmi@gmail.com", 
            password:"#{Rails.configuration.hina_p}", 
            password_confirmation:"#{Rails.configuration.hina_p}") 
