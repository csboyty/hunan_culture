--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: article; Type: TABLE; Schema: public; Owner: dbuser; Tablespace: 
--

CREATE TABLE article (
    deleted boolean NOT NULL,
    created timestamp without time zone NOT NULL,
    updated timestamp without time zone NOT NULL,
    id integer NOT NULL,
    title character varying(64) NOT NULL,
    description text NOT NULL,
    longitude numeric(8,5) NOT NULL,
    latitude numeric(7,5) NOT NULL,
    geo_hash character varying(9) NOT NULL,
    profile character varying(256) NOT NULL,
    user_id integer,
    category_id integer,
    location_id integer,
    _version_id integer NOT NULL,
    content_type smallint DEFAULT 1 NOT NULL,
    date_add date
);


ALTER TABLE article OWNER TO dbuser;

--
-- Name: article_asset; Type: TABLE; Schema: public; Owner: dbuser; Tablespace: 
--

CREATE TABLE article_asset (
    created timestamp without time zone NOT NULL,
    updated timestamp without time zone NOT NULL,
    id integer NOT NULL,
    article_id integer,
    type smallint NOT NULL,
    pos smallint NOT NULL,
    name character varying(128),
    description text,
    profile_filename character varying(128) NOT NULL,
    profile_file character varying(256) NOT NULL,
    media_filename character varying(128),
    media_file character varying(256),
    view_url character varying(512)
);


ALTER TABLE article_asset OWNER TO dbuser;

--
-- Name: article_asset_id_seq; Type: SEQUENCE; Schema: public; Owner: dbuser
--

CREATE SEQUENCE article_asset_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE article_asset_id_seq OWNER TO dbuser;

--
-- Name: article_asset_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dbuser
--

ALTER SEQUENCE article_asset_id_seq OWNED BY article_asset.id;


--
-- Name: article_id_seq; Type: SEQUENCE; Schema: public; Owner: dbuser
--

CREATE SEQUENCE article_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE article_id_seq OWNER TO dbuser;

--
-- Name: article_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dbuser
--

ALTER SEQUENCE article_id_seq OWNED BY article.id;


--
-- Name: article_music; Type: TABLE; Schema: public; Owner: dbuser; Tablespace: 
--

CREATE TABLE article_music (
    id integer NOT NULL,
    author character varying(32)
);


ALTER TABLE article_music OWNER TO dbuser;

--
-- Name: article_tag; Type: TABLE; Schema: public; Owner: dbuser; Tablespace: 
--

CREATE TABLE article_tag (
    article_id integer NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE article_tag OWNER TO dbuser;

--
-- Name: article_video; Type: TABLE; Schema: public; Owner: dbuser; Tablespace: 
--

CREATE TABLE article_video (
    id integer NOT NULL
);


ALTER TABLE article_video OWNER TO dbuser;

--
-- Name: category; Type: TABLE; Schema: public; Owner: dbuser; Tablespace: 
--

CREATE TABLE category (
    id integer NOT NULL,
    name character varying(32) NOT NULL
);


ALTER TABLE category OWNER TO dbuser;

--
-- Name: category_id_seq; Type: SEQUENCE; Schema: public; Owner: dbuser
--

CREATE SEQUENCE category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE category_id_seq OWNER TO dbuser;

--
-- Name: category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dbuser
--

ALTER SEQUENCE category_id_seq OWNED BY category.id;


--
-- Name: location; Type: TABLE; Schema: public; Owner: dbuser; Tablespace: 
--

CREATE TABLE location (
    deleted boolean NOT NULL,
    created timestamp without time zone NOT NULL,
    updated timestamp without time zone NOT NULL,
    id integer NOT NULL,
    name character varying(32) NOT NULL,
    province character varying(12),
    city character varying(24) NOT NULL,
    description text,
    longitude numeric(8,5),
    latitude numeric(7,5),
    geo_hash character varying(9),
    _version_id integer NOT NULL
);


ALTER TABLE location OWNER TO dbuser;

--
-- Name: location_id_seq; Type: SEQUENCE; Schema: public; Owner: dbuser
--

CREATE SEQUENCE location_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE location_id_seq OWNER TO dbuser;

--
-- Name: location_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dbuser
--

ALTER SEQUENCE location_id_seq OWNED BY location.id;


--
-- Name: tag; Type: TABLE; Schema: public; Owner: dbuser; Tablespace: 
--

CREATE TABLE tag (
    id integer NOT NULL,
    name character varying(64) NOT NULL
);


ALTER TABLE tag OWNER TO dbuser;

--
-- Name: tag_id_seq; Type: SEQUENCE; Schema: public; Owner: dbuser
--

CREATE SEQUENCE tag_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tag_id_seq OWNER TO dbuser;

--
-- Name: tag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dbuser
--

ALTER SEQUENCE tag_id_seq OWNED BY tag.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: dbuser; Tablespace: 
--

CREATE TABLE "user" (
    deleted boolean NOT NULL,
    created timestamp without time zone NOT NULL,
    updated timestamp without time zone NOT NULL,
    id integer NOT NULL,
    email character varying(128) NOT NULL,
    fullname character varying(32),
    tel character varying(20),
    password character varying(128),
    active boolean,
    role character varying(16)
);


ALTER TABLE "user" OWNER TO dbuser;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: dbuser
--

CREATE SEQUENCE user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE user_id_seq OWNER TO dbuser;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: dbuser
--

ALTER SEQUENCE user_id_seq OWNED BY "user".id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: dbuser
--

ALTER TABLE ONLY article ALTER COLUMN id SET DEFAULT nextval('article_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: dbuser
--

ALTER TABLE ONLY article_asset ALTER COLUMN id SET DEFAULT nextval('article_asset_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: dbuser
--

ALTER TABLE ONLY category ALTER COLUMN id SET DEFAULT nextval('category_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: dbuser
--

ALTER TABLE ONLY location ALTER COLUMN id SET DEFAULT nextval('location_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: dbuser
--

ALTER TABLE ONLY tag ALTER COLUMN id SET DEFAULT nextval('tag_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: dbuser
--

ALTER TABLE ONLY "user" ALTER COLUMN id SET DEFAULT nextval('user_id_seq'::regclass);


--
-- Name: article_asset_pkey; Type: CONSTRAINT; Schema: public; Owner: dbuser; Tablespace: 
--

ALTER TABLE ONLY article_asset
    ADD CONSTRAINT article_asset_pkey PRIMARY KEY (id);


--
-- Name: article_music_pkey; Type: CONSTRAINT; Schema: public; Owner: dbuser; Tablespace: 
--

ALTER TABLE ONLY article_music
    ADD CONSTRAINT article_music_pkey PRIMARY KEY (id);


--
-- Name: article_pkey; Type: CONSTRAINT; Schema: public; Owner: dbuser; Tablespace: 
--

ALTER TABLE ONLY article
    ADD CONSTRAINT article_pkey PRIMARY KEY (id);


--
-- Name: article_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: dbuser; Tablespace: 
--

ALTER TABLE ONLY article_tag
    ADD CONSTRAINT article_tag_pkey PRIMARY KEY (article_id, tag_id);


--
-- Name: article_video_pkey; Type: CONSTRAINT; Schema: public; Owner: dbuser; Tablespace: 
--

ALTER TABLE ONLY article_video
    ADD CONSTRAINT article_video_pkey PRIMARY KEY (id);


--
-- Name: category_name_key; Type: CONSTRAINT; Schema: public; Owner: dbuser; Tablespace: 
--

ALTER TABLE ONLY category
    ADD CONSTRAINT category_name_key UNIQUE (name);


--
-- Name: category_pkey; Type: CONSTRAINT; Schema: public; Owner: dbuser; Tablespace: 
--

ALTER TABLE ONLY category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);


--
-- Name: location_pkey; Type: CONSTRAINT; Schema: public; Owner: dbuser; Tablespace: 
--

ALTER TABLE ONLY location
    ADD CONSTRAINT location_pkey PRIMARY KEY (id);


--
-- Name: tag_name_key; Type: CONSTRAINT; Schema: public; Owner: dbuser; Tablespace: 
--

ALTER TABLE ONLY tag
    ADD CONSTRAINT tag_name_key UNIQUE (name);


--
-- Name: tag_pkey; Type: CONSTRAINT; Schema: public; Owner: dbuser; Tablespace: 
--

ALTER TABLE ONLY tag
    ADD CONSTRAINT tag_pkey PRIMARY KEY (id);


--
-- Name: user_email_key; Type: CONSTRAINT; Schema: public; Owner: dbuser; Tablespace: 
--

ALTER TABLE ONLY "user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user_pkey; Type: CONSTRAINT; Schema: public; Owner: dbuser; Tablespace: 
--

ALTER TABLE ONLY "user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: article_asset_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbuser
--

ALTER TABLE ONLY article_asset
    ADD CONSTRAINT article_asset_article_id_fkey FOREIGN KEY (article_id) REFERENCES article(id) ON DELETE CASCADE;


--
-- Name: article_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbuser
--

ALTER TABLE ONLY article
    ADD CONSTRAINT article_category_id_fkey FOREIGN KEY (category_id) REFERENCES category(id);


--
-- Name: article_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbuser
--

ALTER TABLE ONLY article
    ADD CONSTRAINT article_location_id_fkey FOREIGN KEY (location_id) REFERENCES location(id) ON DELETE CASCADE;


--
-- Name: article_music_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbuser
--

ALTER TABLE ONLY article_music
    ADD CONSTRAINT article_music_id_fkey FOREIGN KEY (id) REFERENCES article(id) ON DELETE CASCADE;


--
-- Name: article_tag_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbuser
--

ALTER TABLE ONLY article_tag
    ADD CONSTRAINT article_tag_article_id_fkey FOREIGN KEY (article_id) REFERENCES article(id) ON DELETE CASCADE;


--
-- Name: article_tag_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbuser
--

ALTER TABLE ONLY article_tag
    ADD CONSTRAINT article_tag_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE;


--
-- Name: article_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbuser
--

ALTER TABLE ONLY article
    ADD CONSTRAINT article_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user"(id);


--
-- Name: article_video_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbuser
--

ALTER TABLE ONLY article_video
    ADD CONSTRAINT article_video_id_fkey FOREIGN KEY (id) REFERENCES article(id) ON DELETE CASCADE;


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

