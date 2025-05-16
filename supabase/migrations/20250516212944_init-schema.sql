-- Countries
create table countries (
  id serial primary key,
  name varchar(256) not null,
  code varchar(2) not null
);
alter table public.countries enable row level security;

-- States
create table states (
  id serial primary key,
  name varchar(256) not null,
  country_id integer references countries(id)
);
alter table public.states enable row level security;

-- Cities
create table cities (
  id serial primary key,
  name varchar(256) not null,
  country_id integer references countries(id),
  state_id integer references states(id)
);
alter table public.cities enable row level security;

-- People
create table people (
  id serial primary key,
  person_name varchar(256) not null,
  phone varchar(50),
  mobile varchar(50),
  email varchar(256),
  person_type_id smallint,
  gender_id smallint,
  spouse_id integer references people(id)
);
alter table public.people enable row level security;

-- Parishes
create table parishes (
  id serial primary key,
  name varchar(256) not null,
  diocese varchar(256),
  address varchar(256),
  phone varchar(50),
  email varchar(256),
  city_id integer references cities(id)
);
alter table public.parishes enable row level security;

-- StepWays
create table step_ways (
  id serial primary key,
  name varchar(256) not null,
  order_num smallint
);
alter table public.step_ways enable row level security;

-- Communities (debe ir antes de teams)
create table communities (
  id serial primary key,
  number varchar(50) not null,
  born_date date,
  parish_id integer references parishes(id),
  born_brothers smallint,
  actual_brothers smallint,
  step_way_id integer references step_ways(id),
  last_step_way_date date,
  cathechist_team_id integer
);
alter table public.communities enable row level security;

-- TeamTypes
create table team_types (
  id serial primary key,
  name varchar(256) not null,
  order_num smallint
);
alter table public.team_types enable row level security;

-- Teams (ahora sí puede referenciar communities)
create table teams (
  id serial primary key,
  name varchar(256) not null,
  team_type_id integer references team_types(id),
  community_id integer references communities(id)
);
alter table public.teams enable row level security;

-- ParishTeams
create table parish_teams (
  id serial primary key,
  parish_id integer references parishes(id),
  team_id integer references teams(id)
);
alter table public.parish_teams enable row level security;

-- Priests
create table priests (
  id serial primary key,
  person_id integer references people(id),
  is_parish_priest boolean,
  parish_id integer references parishes(id)
);
alter table public.priests enable row level security;

-- Brothers
create table brothers (
  id serial primary key,
  person_id integer references people(id),
  community_id integer references communities(id)
);
alter table public.brothers enable row level security;

-- Belongs
create table belongs (
  id serial primary key,
  person_id integer references people(id),
  community_id integer references communities(id),
  team_id integer references teams(id),
  is_responsible_for_the_team boolean
);
alter table public.belongs enable row level security;

-- CommunityStepLog
create table community_step_log (
  id serial primary key,
  community_id integer references communities(id),
  step_way_id integer references step_ways(id),
  date_of_step date,
  principal_catechist_name varchar(256),
  outcome boolean,
  notes text
);
alter table public.community_step_log enable row level security;

-- Full text search
create index people_person_name_idx on people using gin (to_tsvector('spanish', person_name));
create index parishes_name_idx on parishes using gin (to_tsvector('spanish', name));