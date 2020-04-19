package edu.gatech.cse6242;

import java.io.IOException;
import java.lang.*;
import java.text.*;

import org.apache.hadoop.fs.Path;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.util.*;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;


public class Q1 {
/* TODO: Update variable below with your gtid */
  final String gtid = "sagarwal378";

  public static class DoubleArrayWritable extends ArrayWritable {
    public DoubleArrayWritable() {
        super(DoubleWritable.class);
    }
    public DoubleArrayWritable(DoubleWritable[] t) {
		super(DoubleWritable.class, t);
	}
  }

  public static class TaxiDataMapper
       extends Mapper<Object, Text, Text, DoubleArrayWritable>{

    private final static IntWritable one = new IntWritable(1);
    private Text PickUpId = new Text();

    public void map(Object key, Text value, Context context
                    ) throws IOException, InterruptedException {
      //StringTokenizer itr = new StringTokenizer(value.toString());
      String[] itr = value.toString().split(",");
      PickUpId.set(itr[0]);
      Double distance = Double.parseDouble(itr[2]);
      Double fare = Double.parseDouble(itr[3]);
      if(PickUpId.getLength()>0 && distance>0 && fare>0){
        DoubleWritable res[] = {new DoubleWritable(1), new DoubleWritable(fare)};
        DoubleArrayWritable result = new DoubleArrayWritable(res);
        context.write(PickUpId, result);
      }
    }
  }

  public static class TaxiDataReducer
       extends Reducer<Text,DoubleArrayWritable,Text,Text> {

    private Text result = new Text();
    public void reduce(Text key, Iterable<DoubleArrayWritable> values,
                       Context context
                       ) throws IOException, InterruptedException {
      int num_trips = 0;
      double total_fare = 0.0;
      for (DoubleArrayWritable val : values) {
        Writable res[] = val.get();
	    num_trips += ((DoubleWritable)res[0]).get();
		total_fare += ((DoubleWritable)res[1]).get();
      }
      //num_trips = Math.round(num_trips,2);
      //total_fare = Math.round(total_fare*100.0)/100.0;
      DecimalFormat myFormatter = new DecimalFormat("###,###.##");
      String tf = myFormatter.format(total_fare);
      //String tf = String.format("%,2f", total_fare);
      //total_fare = NumberFormat.getNumberInstance(Locale.US).format(total_fare);
      //num_trips = NumberFormat.getNumberInstance(Locale.US).format(num_trips);
      //DoubleWritable res[] = {new DoubleWritable(num_trips), new DoubleWritable(total_fare)};
      //DoubleArrayWritable result = new DoubleArrayWritable(res);
      result.set(num_trips+","+tf);
      context.write(key, result);
    }
  }

  public static void main(String[] args) throws Exception {
    Configuration conf = new Configuration();
    Job job = Job.getInstance(conf, "Q1");
    job.setJarByClass(Q1.class);
    job.setMapperClass(TaxiDataMapper.class);
    job.setReducerClass(TaxiDataReducer.class);
    job.setMapOutputKeyClass(Text.class);
	job.setMapOutputValueClass(DoubleArrayWritable.class);
    job.setOutputKeyClass(Text.class);
    job.setOutputValueClass(Text.class);
    job.setOutputFormatClass(TextOutputFormat.class);
    /* TODO: Needs to be implemented */

    FileInputFormat.addInputPath(job, new Path(args[0]));
    FileOutputFormat.setOutputPath(job, new Path(args[1]));
    System.exit(job.waitForCompletion(true) ? 0 : 1);
  }
}
