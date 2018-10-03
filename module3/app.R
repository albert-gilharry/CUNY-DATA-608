#
# This is a Shiny web application. You can run the application by clicking
# the 'Run App' button above.
#
# Find out more about building applications with Shiny here:
#
#    http://shiny.rstudio.com/
#

library(shiny)
library(dplyr)
library(plotly)

data <- read.csv("data/cleaned-cdc-mortality-1999-2010-2.csv", sep = ",", header = TRUE, stringsAsFactors = FALSE)
years <- distinct(data, Year)$Year
cause <- distinct(data, ICD.Chapter)$ICD.Chapter

# Define UI for application for assingment

ui <- fluidPage(
  
  # Application title
  titlePanel("Data 608 - Assignment 3 - Albert Gilharry", windowTitle = "Data 608 - Assignment 3 - Albert Gilharry"),
  
  # Sidebar inputs
  sidebarLayout(
    sidebarPanel(
      
      selectInput( inputId = "question",
                   label = "Question:",
                   choices = c("1. Motality Rates Per State by Cause",
                               "2. Mortality Rates vs. National Average")
      ),
      
      selectInput( inputId = "cause",
                   label = "Cause of Mortality:",
                   choices = cause
      ),
      
      selectInput( inputId = "year",
                   label = "Year:",
                   choices = years,
                   selected = 2010
      )
    ),
    
    # create tabs to view a bar chart, a map, and the respective data
    mainPanel(
      tabsetPanel(
        tabPanel("Plot", br(), plotlyOutput("Q1Plot")), 
        tabPanel("Map", plotlyOutput("Q1PlotMap"), "This is an interactive map, hover over a state to get more info!"), 
        tabPanel("Data", br(),DT::dataTableOutput("Q1Table"))
      )
    )
  ),
  
  hr(),
  
  fluidRow(
    column(4,
           strong("About"), br(),
           "This Assignment is a part of the Knowledge & Visual Analytics course of CUNY's Master of Science in Data Science Program. 
            The assignment focuses on web development within the blurred scope of Data Science.", br(), "The data was sourced from ", 
            tags$a(href="https://wonder.cdc.gov/ucd-icd10.html", "https://wonder.cdc.gov/ucd-icd10.html.")
    ),
    column(4,
           strong("Question 1: "), br(),
           "As a researcher, you frequently compare mortality rates from particular causes across 
            different States. You need a visualization that will let you see (for 2010 only) the crude
            mortality rate, across all States, from one cause (for example, Neoplasms, which are
            effectively cancers). Create a visualization that allows you to rank States by crude mortality
            for each cause of death."
    ),
    column(4,
           strong("Question 2: "), br(),
           "Often you are asked whether particular States are improving their mortality rates (per cause)
            faster than, or slower than, the national average. Create a visualization that lets your clients
            see this for themselves for one cause of death at the time. Keep in mind that the national
            average should be weighted by the national population."
    )
  )
)

# handle server requests

server <- function(input, output) {
  #plotly credentials
  
    Sys.setenv("plotly_username"="agilharrysr")
    Sys.setenv("plotly_api_key"="zuCRUxfK09iTCU1aIGDE")
    
    # bar plots
    output$Q1Plot <- renderPlotly({
      
      # Qustion 2 bar plot
      
      if(input$question == "2. Mortality Rates vs. National Average"){
        
        # calulate weighted mean using the percentage of the state's population as weights
        QData <- filter(data, Year == input$year, ICD.Chapter == input$cause) 
        QData$Population.PCT <- round((QData$Population/sum(as.numeric(QData$Population))) * 100,4)
        WMean = round(weighted.mean(QData$Crude.Rate, QData$Population.PCT),4)
        
        QData$State <- factor(QData$State, levels = unique(QData$State)[order(QData$Crude.Rate, decreasing = TRUE)])
        plot_ly(QData, x = ~State, y = ~Crude.Rate, type="bar", name = "State Mortality Rate") %>%
          add_lines(x = c(as.character(QData$State[1]), 
                          as.character(QData$State[nrow(QData)])), 
                    y = c(WMean, WMean), 
                    name = paste0("Weighted National Mortality Rate (",WMean,")")) %>%
         layout( title = "Mortality Rate vs. Weighted National Average")
        
      }
      else{
        
        # Question 1 bar plot
        QData <- filter(data, Year == input$year, ICD.Chapter == input$cause) 
        QData$State <- factor(QData$State, levels = unique(QData$State)[order(QData$Crude.Rate, decreasing = TRUE)])
          plot_ly(QData, x = ~State, y = ~Crude.Rate, type="bar")%>%
          layout( title = "Crude Mortality Rate by State")
      }
      
    })
    
    # State maps
    output$Q1PlotMap <- renderPlotly({
      
      if(input$question == "2. Mortality Rates vs. National Average"){
        # map the difference between the state mortality rate and the national weigted mean mortality rate
          QMapData <- filter(data, Year == input$year, ICD.Chapter == input$cause)
          
          QMapData$Population.PCT <- round((QMapData$Population/sum(as.numeric(QMapData$Population))) * 100,4)
          WMean = round(weighted.mean(QMapData$Crude.Rate, QMapData$Population.PCT),4)
          QMapData$Crude.Rate.Difference <- round(QMapData$Crude.Rate - WMean,4)
         
          QMapData$hover <- with(QMapData, paste("State: ", State, "<br />", 
                                                  "Year: ", Year, "<br />",
                                                  "Crude Mortality Rate - Weighted National Mortality Rate: ", Crude.Rate.Difference, "<br />",
                                                  "Polulation: ", Population, "<br />",
                                                  "Deaths: ", Deaths))
         
         # give state boundaries a white border
         l <- list(color = toRGB("black"), width = 2)
         
         # specify some map projection/options
         g <- list(
           scope = 'usa',
           projection = list(type = 'albers usa'),
           showlakes = TRUE,
           lakecolor = toRGB('white')
           
         )
         
         # plot map
         plot_ly(QMapData) %>%
         add_trace(z = QMapData$Crude.Rate.Difference, 
                   text = QMapData$hover, 
                   locations = QMapData$State,
                   type = 'choropleth', 
                   locationmode = 'USA-states', 
                   colors = 'BuPu') %>%
           colorbar(title = 'Mortality Rate - Weighted National Average') %>%
           layout(title = "<br /> Mortality Rate vs. Weighted National Average", geo = g)
      }
      else{
            # Question 1 map
            # Map the mortality rate per state
            QMapData <- filter(data, Year == input$year, ICD.Chapter == input$cause)
            
            QMapData$hover <- with(QMapData, paste("State: ", State, "<br />", 
                                                     "Year: ", Year, "<br />",
                                                     "Crude Mortality Rate: ", Crude.Rate, "<br />",
                                                     "Polulation: ", Population, "<br />",
                                                     "Deaths: ", Deaths))
            
            # color state boundaries
            l <- list(color = toRGB("black"), width = 2)
            
            # specify some map projection/options
            g <- list(
              scope = 'usa',
              projection = list(type = 'albers usa'),
              showlakes = TRUE,
              lakecolor = toRGB('white')
            )
            
            plot_ly(QMapData) %>%
              add_trace(z = QMapData$Crude.Rate, 
                        text = QMapData$hover, 
                        locations = QMapData$State,
                        type = 'choropleth', 
                        locationmode = 'USA-states', 
                        colors = 'YlGnBu') %>%
              colorbar(title = 'Crude Mortality Rate') %>%
              layout(title = "<br /> Crude Mortality Rate by State ", geo = g)
      }
   })
   
   # Print data for the user
   output$Q1Table <- DT::renderDataTable({
     
    
     if(input$question == "2. Mortality Rates vs. National Average"){
       
       # Print data generated to plot differences in the national mortality and state mortality rate
       
       Q1Data <- filter(data, Year == input$year, ICD.Chapter == input$cause)
       Q1Data$Population.PCT <- round((Q1Data$Population/sum(as.numeric(Q1Data$Population))) * 100,4)
       WMean = round(weighted.mean(Q1Data$Crude.Rate, Q1Data$Population.PCT),4)
       Q1Data$Crude.Rate.Difference <- round(Q1Data$Crude.Rate - WMean,4)
       
       Q1Data$State <- factor(Q1Data$State, levels = unique(Q1Data$State)[order(Q1Data$Crude.Rate, decreasing = TRUE)])
       names(Q1Data) <- c("Cause","State","Year","Deaths","Population","Crude Rate", "Population.PCT","Crude.Rate.Difference")
       DT::datatable(Q1Data, options = list(filter = FALSE, sort= FALSE ))
     }
     else{
       
       # print the data for state mortality rates
       Q1Data <- filter(data, Year == input$year, ICD.Chapter == input$cause)
       Q1Data$State <- factor(Q1Data$State, levels = unique(Q1Data$State)[order(Q1Data$Crude.Rate, decreasing = TRUE)])
       names(Q1Data) <- c("Cause","State","Year","Deaths","Population","Crude Rate")
       DT::datatable(Q1Data, options = list(filter = FALSE, sort= FALSE ))
       
     }
   })
}

# Run the application 
shinyApp(ui = ui, server = server)

